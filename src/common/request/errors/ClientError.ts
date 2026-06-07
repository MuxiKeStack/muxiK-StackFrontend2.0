import { AppError, ErrorContext } from './AppError';

// 客户端请求错误：400/404/409 等非认证类 4xx
export class ClientError extends AppError {
  statusCode: number;

  constructor(statusCode: number, message?: string, context?: Partial<ErrorContext>) {
    super(message || `请求错误 (${statusCode})`, context);
    this.name = 'ClientError';
    this.statusCode = statusCode;
    this.severity = 'toast';
  }
}
