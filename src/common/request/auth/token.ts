import Taro from '@tarojs/taro';

import { readResponseHeader } from '@/common/auth/session';
import { LONG_TOKEN, SHORT_TOKEN } from '@/common/constants/auth';
import { TokenConfig } from '@/common/types/requestType';

import { BASE_URL } from '../constants';

function isValidToken(token: string | undefined): boolean {
  return !!token && token.trim().length > 0;
}

let pendingMainRefresh: Promise<string> | null = null;

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
  if (!config) {
    const shortToken = Taro.getStorageSync<string>(SHORT_TOKEN);
    if (isValidToken(shortToken)) {
      return shortToken;
    }
    return await refreshToken();
  }

  if (config.token) return config.token;

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
      if (pendingMainRefresh) return pendingMainRefresh;

      pendingMainRefresh = refreshMainShortToken().finally(() => {
        pendingMainRefresh = null;
      });
      return pendingMainRefresh;
    }

    if (config.refresh) {
      return await config.refresh();
    }

    throw new Error(`${config.name} 未配置 refresh`);
  } catch (err) {
    throw new Error(`刷新token失败: ${err}`);
  }
}

async function refreshMainShortToken(): Promise<string> {
  const longToken = Taro.getStorageSync<string>(LONG_TOKEN);
  if (!isValidToken(longToken)) {
    throw new Error('未登录或游客模式，无法刷新token');
  }

  const response = await Taro.request({
    method: 'GET',
    url: `${BASE_URL}/users/refresh_token`,
    header: { Authorization: `Bearer ${longToken}` },
  });

  if (response.statusCode === 200 || response.statusCode === 201) {
    const newShortToken = readResponseHeader(
      response.header as Record<string, unknown>,
      'x-jwt-token'
    );
    if (!isValidToken(newShortToken)) {
      throw new Error('刷新短 token 失败');
    }
    Taro.setStorageSync(SHORT_TOKEN, newShortToken);

    return newShortToken as string;
  }

  throw new Error('刷新短 token 失败');
}
