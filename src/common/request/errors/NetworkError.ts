import { AppError, ErrorContext } from './AppError';

/** 网络层错误：超时、断网、DNS 解析失败等 */
export class NetworkError extends AppError {
  constructor(
    message = '网络连接异常，请检查网络后重试',
    context?: Partial<ErrorContext>
  ) {
    super(message, context);
    this.name = 'NetworkError';
    this.recoverable = true;
  }
}
