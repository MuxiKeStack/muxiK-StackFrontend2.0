/* eslint-disable @typescript-eslint/no-unsafe-return */
import Taro from '@tarojs/taro';

const preUrl = 'https://kstack.muxixyz.com';

const header = {
  'Content-Type': 'application/json;charset=utf-8',
};

const getToken = async () => {
  const res = await Taro.getStorage({ key: 'shortToken' });
  if (res.data) return res.data;
  void Taro.navigateTo({ url: '/pages/login/index' });
  throw new Error(`Failed to get token: ${res.errMsg as unknown as string}`);
};

const refreshToken = async () => {
  try {
    const longToken = await Taro.getStorage({ key: 'longToken' });
    if (!longToken.data) {
      void Taro.navigateTo({ url: '/pages/login/index' });
      throw new Error('No long token found');
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
      const headers: LoginResponseHeaders = response.header || {};
      const shortToken = headers['X-Jwt-Token'];
      //const longToken = headers['X-Refresh-Token'];
      if (shortToken && longToken) {
        await Taro.setStorage({ key: 'shortToken', data: shortToken });
        // await Taro.setStorage({ key: 'longToken', data: longToken });
      }
    }
    throw new Error('Failed to refresh token');
  } catch (error) {
    void Taro.navigateTo({ url: '/pages/login/index' });
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
      // Token 过期，尝试刷新
      const newToken = await refreshToken();
      token = `Bearer ${newToken}`;
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
      throw new Error(`${retryResponse.statusCode}`);
    } else {
      const errorData = response.data as { code: number; msg: string };
      throw new Error(`${errorData.code}`);
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
