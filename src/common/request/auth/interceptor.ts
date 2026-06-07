import Taro from '@tarojs/taro';

import { InterceptorContext, RequestConfig } from '@/common/types/requestType';
import { isVisitorMode } from '@/common/utils/isVisitor';

import { AuthError } from '../errors/AuthError';
import { BusinessError } from '../errors/BusinessError';
import { getErrorMeta } from '../errors/errorCodeMap';
import { NetworkError } from '../errors/NetworkError';
import { ServerError } from '../errors/ServerError';
import { refreshToken, tryGetStoredToken } from './token';

export async function requestInterceptors(config?: RequestConfig) {
  const cfg = config ?? ({} as RequestConfig);
  if (cfg.withToken === false) return cfg;

  const token = await tryGetStoredToken(cfg.tokenConfig);

  if (token) {
    cfg.header = cfg.header || {};
    cfg.header['Authorization'] = `Bearer ${token.trim()}`;
  }

  return cfg;
}

function requestHadAuthorization(
  requestConfig: Taro.request.Option | Taro.uploadFile.Option
): boolean {
  const header = requestConfig.header as Record<string, string> | undefined;
  const auth = header?.Authorization ?? header?.authorization;
  return typeof auth === 'string' && auth.trim().length > 0;
}

export async function responseInterceptors(
  context: InterceptorContext,
  config?: RequestConfig
): Promise<any> {
  const { response } = context;

  switch (response.statusCode) {
    case 200:
    case 201:
    case 204:
      if (config?.returnFullResponse) return response;
      return unwrapResponse(response);

    case 401:
      return await handleTokenRefresh(context);

    case 403:
      throw new AuthError(403);

    case 500:
    case 502:
    case 503:
      throw new ServerError(response.statusCode);

    default: {
      if (response.statusCode >= 400 && response.statusCode < 500) {
        const body = response.data as { msg?: string; message?: string } | undefined;
        const msg = body?.msg || body?.message || `请求错误 (${response.statusCode})`;
        throw new AuthError(response.statusCode, msg);
      }
      if (response.statusCode >= 500) {
        throw new ServerError(response.statusCode);
      }
      throw new NetworkError();
    }
  }
}

function unwrapResponse(response: Taro.request.SuccessCallbackResult): unknown {
  const body = response.data as
    | { code?: number; data?: unknown; msg?: string }
    | undefined;

  if (!body || typeof body.code !== 'number') {
    return response.data;
  }

  if (body.code === 0) {
    const data = body.data !== undefined ? body.data : body;
    if (data !== null && typeof data === 'object') {
      try {
        Object.defineProperty(data, 'data', {
          value: data,
          enumerable: false,
          writable: false,
          configurable: false,
        });
      } catch {
        //
      }
    }
    return data;
  }

  const meta = getErrorMeta(body.code);
  const message = body.msg || meta.msg;
  throw new BusinessError(body.code, message, body.data);
}

async function handleTokenRefresh(context: InterceptorContext): Promise<unknown> {
  const { config, requestConfig } = context;

  if (config.withToken === false) {
    throw new AuthError(401, '请求不需要token');
  }

  if (!requestHadAuthorization(requestConfig) || isVisitorMode()) {
    throw new AuthError(401, '请先登录');
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

      if (
        retryResponse.statusCode === 200 ||
        retryResponse.statusCode === 201 ||
        retryResponse.statusCode === 204
      ) {
        if (config?.returnFullResponse) return retryResponse;
        return unwrapResponse(retryResponse);
      } else if (retryResponse.statusCode === 401) {
        continue;
      } else {
        throw new ServerError(
          retryResponse.statusCode,
          `刷新后请求失败: ${retryResponse.statusCode}`
        );
      }
    } catch (refreshError: unknown) {
      if (refreshError instanceof AuthError || refreshError instanceof BusinessError) {
        throw refreshError;
      }

      console.error(
        `第${retryCount + 1}次 token 刷新失败:`,
        (refreshError as Error)?.message
      );

      const isLastAttempt = retryCount === maxRetry - 1;
      if (isLastAttempt) {
        tokenConfig?.onRefreshError?.(refreshError as Error);
        throw new AuthError(401, '登录已过期，请重新登录');
      }
    }
  }

  throw new AuthError(401, '登录已过期，请重新登录');
}
