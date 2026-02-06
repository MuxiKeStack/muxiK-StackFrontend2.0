import Taro from '@tarojs/taro';

import {
  InterceptorContext,
  RequestConfig,
  UploadConfig,
} from '@/common/types/requestType';

import { BASE_URL } from '../constants';
import { requestInterceptors, responseInterceptors } from './auth/interceptor';

type ParamsOption = {
  params?: Record<string, string>;
  query?:
    | string
    | Record<string, string | number | boolean | Array<string | number | boolean>>;
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

async function baseRequest(
  path: string,
  method: keyof Taro.request.Method,
  body?: any,
  params?: ParamsOption,
  config?: RequestConfig
): Promise<any> {
  const url = resolvePathWithParams(path, params, config?.baseUrl);

  const interceptedConfig = await requestInterceptors(config || {});

  let context: InterceptorContext;

  // Taro里文件上传和普通请求用的request不一样，分开了
  if (interceptedConfig.upload?.filePath) {
    context = await handleFileUpload(
      url,
      body,
      interceptedConfig as RequestConfig & { upload: UploadConfig }
    );
  } else {
    context = await handleNormalRequest(url, method, body, interceptedConfig);
  }

  const res = await responseInterceptors(context);

  return res.data;
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
    header: {
      'Content-Type': 'multipart/form-data',
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
  async get<P extends string>(
    path: P,
    params?: ParamsOption,
    config?: RequestConfig
  ): Promise<any> {
    return baseRequest(path, 'GET', undefined, params, config);
  },

  async post<P extends string>(
    path: P,
    body?: any,
    config?: RequestConfig
  ): Promise<any> {
    return baseRequest(path, 'POST', body, undefined, config);
  },

  async put<P extends string>(path: P, body?: any, config?: RequestConfig): Promise<any> {
    return baseRequest(path, 'PUT', body, undefined, config);
  },

  async delete<P extends string>(
    path: P,
    params?: ParamsOption,
    config?: RequestConfig
  ): Promise<any> {
    return baseRequest(path, 'DELETE', undefined, params, config);
  },

  async patch<P extends string>(
    path: P,
    body?: any,
    config?: RequestConfig
  ): Promise<any> {
    return baseRequest(path, 'PATCH', body, undefined, config);
  },

  async head<P extends string>(
    path: P,
    params?: ParamsOption,
    config?: RequestConfig
  ): Promise<any> {
    return baseRequest(path, 'HEAD', undefined, params, config);
  },

  async options<P extends string>(
    path: P,
    params?: ParamsOption,
    config?: RequestConfig
  ): Promise<any> {
    return baseRequest(path, 'OPTIONS', undefined, params, config);
  },
};

export { request };
