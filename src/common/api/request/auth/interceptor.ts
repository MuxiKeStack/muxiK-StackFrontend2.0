import Taro from '@tarojs/taro';

import { InterceptorContext, RequestConfig } from '@/common/types/requestType';

import { getStoredToken, refreshToken } from './token';

export async function requestInterceptors(config: RequestConfig) {
  if (config.withToken === false) return config;

  try {
    const token = await getStoredToken(config.tokenConfig);

    if (token) {
      config.header = config.header || {};
      config.header['Authorization'] = `Bearer ${token.trim()}`;
    }
  } catch (err) {
    if (config.onRequestError) config.onRequestError(err);
    throw new Error(`token挂载失败: ${err}`);
  }

  return config;
}

export async function responseInterceptors(context: InterceptorContext) {
  const { response } = context;

  switch (response.statusCode) {
    case 200:
    case 201:
    case 204:
      return response;
    case 401:
      return await handleTokenRefresh(context);
    case 403:
      throw new Error('无权限');
    default:
      throw new Error('服务器错误');
  }
}

async function handleTokenRefresh(
  context: InterceptorContext
): Promise<Taro.request.SuccessCallbackResult> {
  const { config, requestConfig } = context;

  if (config.withToken === false) {
    throw new Error('刷新失败，请求不需要token');
  }

  const tokenConfig = config.tokenConfig;
  const maxRetry = tokenConfig?.maxRetry || 1;

  for (let retryCount = 0; retryCount < maxRetry; retryCount++) {
    try {
      const newToken = await refreshToken(tokenConfig);

      tokenConfig?.onRefreshSuccess?.(newToken);

      const retryResponse = await Taro.request({
        ...requestConfig,
        header: {
          ...requestConfig.header,
          Authorization: `Bearer ${newToken}`,
        },
      });

      if (retryResponse.statusCode === 200 || retryResponse.statusCode === 201) {
        return retryResponse;
      } else if (retryResponse.statusCode === 401) {
        continue;
      } else {
        throw new Error(`token 刷新过程出现其他错误, :${retryResponse.statusCode}`);
      }
    } catch (refreshError: unknown) {
      const error =
        refreshError instanceof Error
          ? refreshError
          : new Error(typeof refreshError === 'string' ? refreshError : '未知刷新错误');

      console.error(`第${retryCount + 1}次 token获取失败:`, error.message);

      const isLastAttempt = retryCount === maxRetry - 1;

      if (isLastAttempt) {
        tokenConfig?.onRefreshError?.(error);
        throw new Error(`Token刷新失败: ${error.message}`);
      }
    }
  }

  throw new Error('token 过期, 达到重刷新次数上限');
}
