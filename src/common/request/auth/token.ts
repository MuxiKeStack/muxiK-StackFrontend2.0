import Taro from '@tarojs/taro';

import { TokenConfig } from '@/common/types/requestType';

import { BASE_URL } from '../constants';

function isValidToken(token: string | undefined): boolean {
  return !!token && token.trim().length > 0;
}

// 有有效 token 则返回，否则返回 null（不抛错，因为可能是游客请求)
export async function tryGetStoredToken(config?: TokenConfig): Promise<string | null> {
  try {
    const token = await getStoredToken(config);
    return isValidToken(token) ? token : null;
  } catch {
    return null;
  }
}

export async function getStoredToken(config?: TokenConfig): Promise<string> {
  // 主登录态：直接读 shortToken
  if (!config) {
    const shortToken = Taro.getStorageSync<string>('shortToken');
    if (!isValidToken(shortToken)) {
      throw new Error('未登录或游客模式，无法获取有效token');
    }
    return shortToken;
  }

  if (config.token) return config.token;

  // 用 getStorageSync 读取独立域 token：缺 key 时返回 ''，不会触发微信的 getStorage:fail 报错
  const cached = Taro.getStorageSync<string>(config.name);
  if (isValidToken(cached)) {
    config.onRefreshSuccess?.(cached);
    return cached;
  }

  return await refreshToken(config);
}

export async function refreshToken(config?: TokenConfig): Promise<string> {
  try {
    if (!config) {
      const result = await Taro.getStorage({ key: 'longToken' });
      const longToken = result.data as string;

      if (!isValidToken(longToken)) {
        throw new Error('未登录或游客模式，无法刷新token');
      }
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
