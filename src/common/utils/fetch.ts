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

const request = async (
  url = '',
  method: 'GET' | 'POST' = 'GET',
  data = {},
  isToken = true
) => {
  const token = isToken ? `Bearer ${await getToken()}` : '';
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

export const post = (url = '', data = {}) => request(url, 'POST', data, true);
export const get = (url = '') => request(url, 'GET', {}, true);
