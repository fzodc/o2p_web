/**
 * request 网络请求工具
 * 更详细的api文档: https://bigfish.alipay.com/doc/api#request
 * http://npm.taobao.org/package/umi-request
 */
import { extend } from 'umi-request';
import { notification } from 'antd';
import router from 'umi/router';

import constants from '@/utils/constUtil';
import {push} from '@/utils/log';

const {DEBUG} = constants;
const codeMessage = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};

/**
 * 异常处理程序
 */
const errorHandler = error => {
  const { response = {} } = error;
  const errortext = codeMessage[response.status] || response.statusText;
  const { status, url } = response;

  console.log(status,url);
  if (status === 401) {
    // response.body.getReader().read().then(function(result, done) {
    //   if (!done) {
    //     console.log(result);
    //   }
    // });
    let message='未登录或登录已过期，请重新登录。';
    response.json().then(function(json) {
      message=`code=${json.code},${json.msg},${message}`
    });;
    notification.error({
      message,
    });
    // @HACK
    /* eslint-disable no-underscore-dangle */
    window.g_app._store.dispatch({
      type: 'login/logout',
    });
    return;
  }
  notification.error({
    message: `请求错误 ${status}: ${url}`,
    description: errortext,
  });
  // environment should not be used
  if (status === 403) {
    router.push('/exception/403');
    return;
  }
  if (status <= 504 && status >= 500) {
    console.log(status);
    router.push('/exception/500');
    return;
  }
  if (status >= 404 && status < 422) {
    console.log(status);
    router.push('/exception/404');
  }
};


// let token="";
/**
 * 配置request请求时的默认参数
 */
const request = extend({
  errorHandler, // 默认错误处理
  credentials: 'include', // 默认请求是否带上cookie
  // headers:{Authorization:token},
});

request.interceptors.response.use( (response) => {
  response.headers.forEach((value,key)=>{
    // console.log("==============12:",key,":",value);
    if(key.toLowerCase()==='RspToken'.toLowerCase()){
      console.log("=====12",value);
      // localStorage.removeItem("token");
      localStorage.setItem("token",value);
    }
  });
  return response;
});

if(DEBUG){
request.interceptors.response.use( (response, options) => {
  // response.headers.append('interceptors', 'yes');
  // console.log("=====10",JSON.stringify(response.body));
  // console.log("=====11",options);
  // console.log("=====13",token);
  // const data = response.clone().json();
  // if(data){
  //   console.log("===10",data);
  // }
  try{
    const cloneResponse=response.status===200?response.clone().json():response.clone().text();
    cloneResponse.then((data)=>{
        const logObj={};
        logObj.request=options.data;
        logObj.url=response.url;
        logObj.date=new Date();
        logObj.status=response.status;
        logObj.statusText=response.statusText;
        logObj.response=data;
        push(logObj);
        return data;
      });
  } catch (e) {
    console.log("dddd-----error---ddddd");
    const logObj={};
    logObj.url=response.url;
    logObj.date=new Date();
    logObj.status=response.status;
    logObj.statusText=response.statusText;
    logObj.request=options.data;
    logObj.response=e.toString();
    push(logObj);} // eslint-disable-line
  return response;
});
}
request.interceptors.request.use((url, options) => {
  const token=localStorage.getItem("token");
  // console.log("====1",`Bearer ${token}`);
  // console.log("====2",options.data);
  const newOptions=token===""?{...options}:{ ...options, headers:{Authorization:`Bearer ${token}`}};
  return (
    {
      url: `${url}`,
      options: newOptions,
    }
  );
});

export default request;
