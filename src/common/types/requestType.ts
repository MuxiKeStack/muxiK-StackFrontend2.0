export interface TokenConfig {
  // token名称，用于区分不同 token
  name: string;
  // 如果已有 token，直接使用
  token?: string;
  // 重新刷新次数
  maxRetry?: number;
  // 自定义刷新逻辑
  refresh: () => Promise<string>;
  // 刷新失败回调
  onRefreshError?: (error: Error) => void;
  // 刷新成功回调
  onRefreshSuccess?: (newToken: string) => void;
}

export interface UploadConfig {
  // 小程序临时文件路径
  filePath: string;
  // 文件对应的字段名
  fileFieldName?: string;
  // 额外的文件数据
  formData?: Record<string, any>;
  // 是否自动将 body 合并到 formData 中
  mergeBodyToFormData?: boolean;
}

export interface RequestConfig {
  baseUrl?: string;
  withToken?: boolean;
  tokenConfig?: TokenConfig;
  header?: Record<string, string>;
  upload?: UploadConfig;
  returnFullResponse?: boolean;
  onRequestError?: (error: unknown) => void;
}

export interface InterceptorContext {
  requestConfig: Taro.request.Option | Taro.uploadFile.Option;
  config: RequestConfig;
  response: Taro.request.SuccessCallbackResult;
}
