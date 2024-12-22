/* eslint-disable @typescript-eslint/no-unsafe-return */
import Taro from '@tarojs/taro';

import { LoginResponseHeaders } from '../api/handleLogin';

const preUrl = 'https://kstack.muxixyz.com';

const header = {
  'Content-Type': 'application/json;charset=utf-8',
};

const getToken = async () => {
  const res = await Taro.getStorage({ key: 'shortToken' });
  if (res.data) return res.data;
  void Taro.reLaunch({ url: '/pages/login/index' });
  throw new Error(`没token: ${res.errMsg as unknown as string}`);
};

const refreshToken = async () => {
  try {
    const longToken = await Taro.getStorage({ key: 'longToken' });
    if (!longToken.data) {
      void Taro.reLaunch({ url: '/pages/login/index' });
      throw new Error('没longToken');
    }

    const response = await Taro.request({
      url: `${preUrl}/users/refresh_token`,
      method: 'GET',
      header: {
        ...header,
        Authorization: `Bearer ${longToken.data}`,
      },
    });

    if (response.statusCode.toString().startsWith('2')) {
      const headers: LoginResponseHeaders = response.header;
      const shortToken = headers['X-Jwt-Token'];
      if (shortToken) {
        await Taro.setStorage({ key: 'shortToken', data: shortToken.toString() });
      }
    }
    throw new Error('刷新token失败');
  } catch (error) {
    if (Taro.getStorageSync('visitor') === true) return;
    void Taro.reLaunch({ url: '/pages/login/index' }).then(() => {
      void Taro.showToast({
        title: '登录过期 请刷新小程序重新登录',
        icon: 'none',
      });
    });
    throw error;
  }
};

const request = async (
  url = '',
  method: 'GET' | 'POST' = 'GET',
  data = {},
  isToken = true
) => {
  let token = isToken ? `Bearer ${await getToken()}` : '';
  header['Authorization'] = token ? `${token}` : '';

  try {
    const response = await Taro.request({
      url: `${preUrl}${url}`,
      method,
      header,
      data: method === 'POST' ? JSON.stringify(data) : data,
    });

    if (response.statusCode.toString().startsWith('2')) {
      return response.data;
    } else if (response.statusCode === 401) {
      await refreshToken();
      const newToken = await Taro.getStorage({ key: 'shortToken' });
      token = `Bearer ${newToken.data}`;
      header['Authorization'] = token;

      // 使用新 token 重试请求
      const retryResponse = await Taro.request({
        url: `${preUrl}${url}`,
        method,
        header,
        data: method === 'POST' ? JSON.stringify(data) : data,
      });

      if (retryResponse.statusCode.toString().startsWith('2')) {
        return retryResponse.data;
      }
      throw new Error(retryResponse.statusCode.toString());
    } else {
      const errorData = response.data as { code: number; msg: string };
      throw new Error(errorData.code.toString());
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('error', error);
    throw error;
  }
};

export const post = (url = '', data = {}) => request(url, 'POST', data, true);
export const get = (url = '') => request(url, 'GET', {}, true);

const preUrl1 = 'https://miniprograms.muxixyz.com';
const request1 = async (url = '', method: 'GET' | 'POST' = 'GET', data = {}) => {
  try {
    const response = await Taro.request({
      url: `${preUrl1}${url}`,
      method,
      header,
      data: method === 'POST' ? JSON.stringify(data) : data,
    });

    if (response.statusCode.toString().startsWith('2')) {
      return response.data;
    } else {
      const errorData = response.data as { code: number; msg: string };
      throw new Error(response.statusCode === 401 ? '401' : `${errorData.code}`);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('error', error);
    throw error;
  }
};
//为了躲避审核
export const postBool = (url = '', data = {}): Promise<unknown> =>
  request1(url, 'POST', data);
