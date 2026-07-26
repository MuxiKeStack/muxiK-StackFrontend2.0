import { AppError, ErrorContext } from './AppError';

/** 业务层错误：后端返回 code !== 0 */
export class BusinessError extends AppError {
  code: number;
  data?: unknown;

  constructor(
    code: number,
    message: string,
    data?: unknown,
    context?: Partial<ErrorContext>
  ) {
    super(message, context);
    this.name = 'BusinessError';
    this.code = code;
    this.data = data;
  }
}
