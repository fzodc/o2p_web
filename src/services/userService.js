import request from '@/utils/request';
import constants from '@/utils/constUtil';

const {PREFIX_PATH} = constants;

export async function query() {
  return request('/api/users');
}

export async function queryCurrent() {
  return request('/api/currentUser');
}

export async function fakeAccountLogin(params) {
  return request(`${PREFIX_PATH}/auth/login`, {
    method: 'POST',
    data: params,
  });
}

export async function fakeRegister(params) {
  return request(`/baseInfo/sys/register`, {
    method: 'POST',
    data: params,
  });
}

export async function getFakeCaptcha(mobile) {
  return request(`/baseInfo/sys/captcha?mobile=${mobile}`);
}

// export async function roleList() {
//   return request(`/baseInfo/sysdata/allRoleList`);
// }
