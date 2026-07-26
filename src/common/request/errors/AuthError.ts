import { AppError, ErrorContext } from './AppError';

/** 认证/授权错误：401 Token 过期、403 无权限 */
export class AuthError extends AppError {
  statusCode: number;

  constructor(statusCode: number, message?: string, context?: Partial<ErrorContext>) {
    super(
      message || (statusCode === 401 ? '登录已过期，请重新登录' : '无权限访问'),
      context
    );
    this.name = 'AuthError';
    this.statusCode = statusCode;
    this.severity = statusCode === 401 ? 'modal' : 'toast';
  }
}
