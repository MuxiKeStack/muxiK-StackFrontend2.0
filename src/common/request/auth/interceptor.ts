import Taro from '@tarojs/taro';

import { InterceptorContext, RequestConfig } from '@/common/types/requestType';
import { isVisitorMode } from '@/common/utils/isVisitor';

import { AuthError } from '../errors/AuthError';
import { BusinessError } from '../errors/BusinessError';
import { ClientError } from '../errors/ClientError';
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
        // 非 401/403 的 4xx 是普通客户端错误，不是登录态问题，不能抛 AuthError 触发登出
        throw new ClientError(response.statusCode, msg);
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

// 刷新 token 后重发请求：上传请求要走 Taro.uploadFile，普通请求走 Taro.request，
// 否则用 Taro.request 重发上传请求会丢掉 filePath 导致重试无效
async function retryWithToken(
  requestConfig: Taro.request.Option | Taro.uploadFile.Option,
  newToken: string
): Promise<Taro.request.SuccessCallbackResult> {
  const authHeader = {
    ...requestConfig.header,
    Authorization: `Bearer ${newToken}`,
  };

  if ('filePath' in requestConfig && requestConfig.filePath) {
    const uploaded = await Taro.uploadFile({
      ...(requestConfig as Taro.uploadFile.Option),
      header: authHeader,
    });
    let parsedData: unknown;
    try {
      parsedData = JSON.parse(uploaded.data);
    } catch {
      parsedData = uploaded.data;
    }
    return {
      data: parsedData,
      statusCode: uploaded.statusCode,
      header: {},
      cookies: [],
      errMsg: uploaded.errMsg,
    } as Taro.request.SuccessCallbackResult;
  }

  return await Taro.request({
    ...(requestConfig as Taro.request.Option),
    header: authHeader,
  });
}

async function handleTokenRefresh(context: InterceptorContext): Promise<unknown> {
  const { config, requestConfig } = context;

  // 带 tokenConfig 的请求属于独立 token 域（如反馈表/飞书），
  // 其 401 不应被当作主登录过期，统一标记为 resource 域，交由 authHandler 跳过登出
  const tokenConfig = config.tokenConfig;
  const isResourceScope = !!tokenConfig;
  const scopeContext = isResourceScope ? { meta: { scope: 'resource' } } : undefined;

  if (config.withToken === false) {
    throw new AuthError(401, '请求不需要token', scopeContext);
  }

  if (!requestHadAuthorization(requestConfig) || isVisitorMode()) {
    throw new AuthError(401, '请先登录', scopeContext);
  }

  const maxRetry = tokenConfig?.maxRetry || 1;

  for (let retryCount = 0; retryCount < maxRetry; retryCount++) {
    try {
      const newToken = await refreshToken(tokenConfig);
      tokenConfig?.onRefreshSuccess?.(newToken);

      const retryResponse = await retryWithToken(requestConfig, newToken);

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
        throw new AuthError(401, '登录已过期，请重新登录', scopeContext);
      }
    }
  }

  throw new AuthError(401, '登录已过期，请重新登录', scopeContext);
}
