import Taro from '@tarojs/taro';

import {
  InterceptorContext,
  RequestConfig,
  UploadConfig,
} from '@/common/types/requestType';

import { requestInterceptors, responseInterceptors } from './auth/interceptor';
import { BASE_URL, DEFAULT_TIMEOUT } from './constants';
import { globalErrorHandler } from './handlers/globalErrorHandler';

type ParamsOption = {
  params?: Record<string, string>;
  query?: string | object;
};

function resolvePathWithParams(
  path: string,
  option?: ParamsOption,
  baseUrl?: string
): string {
  if (!option) {
    return combineUrl(path, baseUrl);
  }

  let resolvedPath = path;
  const { params, query } = option;

  if (params && typeof params === 'object') {
    resolvedPath = resolvedPath.replace(/:(\w+)\b/g, (match, paramName) => {
      if (Object.prototype.hasOwnProperty.call(params, paramName)) {
        return params[paramName as keyof typeof params];
      }
      return match;
    });
  }

  if (query) {
    let queryString: string;

    if (typeof query === 'string') {
      queryString = query.replace(/^\?/, '').trim();
    } else {
      const queryParams = new URLSearchParams();

      Object.entries(query).forEach(([key, value]) => {
        if (value == null) return;

        if (Array.isArray(value)) {
          value.forEach((item) => {
            if (item != null) {
              queryParams.append(key, String(item));
            }
          });
        } else {
          const stringValue =
            typeof value === 'boolean' ? (value ? 'true' : 'false') : String(value);
          queryParams.append(key, stringValue);
        }
      });

      queryString = queryParams.toString();
    }

    if (queryString) {
      resolvedPath += `?${queryString}`;
    }
  }

  return combineUrl(resolvedPath, baseUrl);
}

function combineUrl(path: string, baseUrl?: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const effectiveBaseUrl = baseUrl || BASE_URL;

  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  return `${effectiveBaseUrl}/${cleanPath}`;
}

async function baseRequest<T = any>(
  path: string,
  method: keyof Taro.request.Method,
  body?: any,
  params?: ParamsOption,
  config?: RequestConfig
): Promise<T> {
  const url = resolvePathWithParams(path, params, config?.baseUrl);

  const interceptedConfig = await requestInterceptors(config);

  let context: InterceptorContext;

  if (interceptedConfig.upload?.filePath) {
    context = await handleFileUpload(
      url,
      body,
      interceptedConfig as RequestConfig & { upload: UploadConfig }
    );
  } else {
    context = await handleNormalRequest(url, method, body, interceptedConfig);
  }

  try {
    const res = await responseInterceptors(context, interceptedConfig);

    if (interceptedConfig.returnFullResponse) return res as T;

    return res as T;
  } catch (error: unknown) {
    return handleRequestError(error, interceptedConfig);
  }
}

function handleRequestError(error: unknown, config: RequestConfig): never {
  const errorConfig = config.errorConfig;

  // 自定义错误处理
  if (errorConfig?.onError) {
    errorConfig.onError(error);
    if (errorConfig.fallback !== undefined) {
      return errorConfig.fallback as never;
    }

    throw error;
  }

  if (!errorConfig?.silent) {
    globalErrorHandler.handle(error).catch(() => {});
  }

  if (errorConfig?.fallback !== undefined) {
    return errorConfig.fallback as never;
  }

  throw error;
}

async function handleNormalRequest(
  url: string,
  method: keyof Taro.request.Method,
  body: any,
  config: RequestConfig
): Promise<InterceptorContext> {
  const requestConfig: Taro.request.Option = {
    url,
    method,
    data: body,
    timeout: config.timeout ?? DEFAULT_TIMEOUT,
    ...config,
  };

  const response = await Taro.request(requestConfig);

  return {
    requestConfig,
    config,
    response,
  };
}

async function handleFileUpload(
  url: string,
  body: any,
  config: RequestConfig & { upload: NonNullable<RequestConfig['upload']> }
): Promise<InterceptorContext> {
  const { upload } = config;
  const fileFieldName = upload.fileFieldName || 'file';

  const formData: Record<string, any> = { ...(upload.formData || {}) };

  if (upload.mergeBodyToFormData !== false && body) {
    if (typeof body === 'object') {
      Object.assign(formData, body);
    } else {
      formData['_payload'] = body;
    }
  }

  const uploadOption: Taro.uploadFile.Option = {
    url,
    filePath: upload.filePath,
    name: fileFieldName,
    formData,
    timeout: config.timeout ?? DEFAULT_TIMEOUT,
    header: {
      ...config.header,
    },
  };

  const response = await new Promise<Taro.uploadFile.SuccessCallbackResult>(
    (resolve, reject) => {
      Taro.uploadFile(uploadOption).then(resolve).catch(reject);
    }
  );

  let parsedData;
  try {
    parsedData = JSON.parse(response.data);
  } catch (e) {
    parsedData = { raw: response.data };
  }

  const processedResponse = {
    ...response,
    data: parsedData,
    statusCode: response.statusCode,
    header: response.header || {},
  };

  return {
    requestConfig: uploadOption,
    config,
    response: processedResponse,
  };
}

const request = {
  async get<T = any>(
    path: string,
    params?: ParamsOption,
    config?: RequestConfig
  ): Promise<T> {
    return baseRequest<T>(path, 'GET', undefined, params, config);
  },

  async post<T = any>(path: string, body?: any, config?: RequestConfig): Promise<T> {
    return baseRequest<T>(path, 'POST', body, undefined, config);
  },

  async put<T = any>(path: string, body?: any, config?: RequestConfig): Promise<T> {
    return baseRequest<T>(path, 'PUT', body, undefined, config);
  },

  async delete<T = any>(
    path: string,
    params?: ParamsOption,
    config?: RequestConfig
  ): Promise<T> {
    return baseRequest<T>(path, 'DELETE', undefined, params, config);
  },

  async patch<T = any>(path: string, body?: any, config?: RequestConfig): Promise<T> {
    return baseRequest<T>(path, 'PATCH', body, undefined, config);
  },

  async head<T = any>(
    path: string,
    params?: ParamsOption,
    config?: RequestConfig
  ): Promise<T> {
    return baseRequest<T>(path, 'HEAD', undefined, params, config);
  },

  async options<T = any>(
    path: string,
    params?: ParamsOption,
    config?: RequestConfig
  ): Promise<T> {
    return baseRequest<T>(path, 'OPTIONS', undefined, params, config);
  },
};

export { request };
