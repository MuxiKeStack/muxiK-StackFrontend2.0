/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable no-console */

import Taro from '@tarojs/taro';

import { get } from '../api/get';

export interface WebGetTubeTokenData {
  access_token: string;
  domain_name: string;
}
export interface QiniuUploadResponse {
  key: string;
  hash: string;
}
export interface ResponseQiniu {
  code?: number;
  data: WebGetTubeTokenData;
  msg?: string;
}
export const fetchQiniuToken = async () => {
  try {
    const url = '/tube/access_token';

    const response: ResponseQiniu = await get(url);
    console.log('response', response);
    return response.data;
  } catch (error) {
    console.error('Error fetching Qiniu token:', error);
  }
};
export const fetchToQiniu = async (filepath) => {
  try {
    const data = await fetchQiniuToken();
    if (!data || !data.access_token || !data.domain_name) {
      throw new Error('Qiniu token 无');
    }

    const { access_token, domain_name } = data;

    return new Promise((resolve, reject) => {
      void Taro.uploadFile({
        url: 'https://upload-z2.qiniup.com/',
        filePath: filepath,
        name: 'file',
        formData: {
          token: access_token,
        },
        success: (res) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          resolve(`https://${domain_name}/${JSON.parse(res.data)?.key}`);
        },
        fail: (err) => {
          // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
          reject(err);
        },
      });
    });
  } catch (error) {
    console.error('Error in fetchToQiniu:', error);
    throw error;
  }
};
