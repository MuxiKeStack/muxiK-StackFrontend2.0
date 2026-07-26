import { AppError, ErrorContext } from './AppError';

/** 服务端错误：500/502/503 等 */
export class ServerError extends AppError {
  statusCode: number;

  constructor(statusCode: number, message?: string, context?: Partial<ErrorContext>) {
    super(message || `服务器异常 (${statusCode})，请稍后重试`, context);
    this.name = 'ServerError';
    this.statusCode = statusCode;
    this.recoverable = true;
  }
}
