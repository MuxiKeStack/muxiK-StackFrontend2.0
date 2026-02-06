import Taro from '@tarojs/taro';

import { TokenConfig } from '@/common/types/requestType';

import { BASE_URL } from '../../constants';

export async function getStoredToken(config?: TokenConfig): Promise<string> {
  try {
    if (!config) {
      const result = await Taro.getStorage({ key: 'shortToken' });
      const shortToken = result.data as string;
      if (shortToken) return shortToken;
      return await refreshToken();
    }

    if (config.token) return config.token;

    return new Promise((resolve, reject) => {
      Taro.getStorage({
        key: `${config.name}`,

        success: function (res) {
          const token = res.data as string;

          if (config.onRefreshSuccess) {
            config.onRefreshSuccess(token);
          }

          if (token) {
            resolve(token);
          } else {
            console.log('storage中的token为空，开始刷新');
            refreshToken(config).then(resolve).catch(reject);
          }
        },

        fail: function (err) {
          const errorMsg = err.errMsg || '';

          if (errorMsg.includes('data not found')) {
            console.log(`${config.name} 不存在，开始刷新token`);
            refreshToken(config).then(resolve).catch(reject);
          } else {
            console.error('获取storage失败:', err);
            reject(new Error(`获取token失败: ${errorMsg}`));
          }
        },
      });
    });
  } catch (err) {
    throw new Error(`获取token失败: ${err}`);
  }
}

export async function refreshToken(config?: TokenConfig): Promise<string> {
  try {
    if (!config) {
      const result = await Taro.getStorage({ key: 'longToken' });
      const longToken = result.data as string;

      if (!longToken) throw new Error('长 token 不存在');
      // todos: 未完成,后端貌似没有这个接口,相信后人完成
      const response = await Taro.request({
        method: 'GET',
        url: `${BASE_URL}/users/refresh_token`,
        header: { Authorization: `Bearer ${longToken}` },
      });

      if (response.statusCode === 200 || response.statusCode === 201) {
        const newShortToken = response.header['x-jwt-token'] as string;
        await Taro.setStorage({
          key: 'shortToken',
          data: newShortToken,
        });
        return newShortToken;
      }

      throw new Error('刷新短 token 失败');
    }

    if (config.refresh) {
      return await config.refresh();
    }

    throw new Error(`${config.name} 未配置 refresh`);
  } catch (err) {
    throw new Error(`刷新token失败: ${err}`);
  }
}
