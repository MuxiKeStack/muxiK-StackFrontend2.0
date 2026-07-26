/**
 * 错误严重级别
 * - silent: 静默，不提示用户
 * - toast: 轻提示（默认）
 * - modal: 模态框，需要用户确认
 * - fatal: 严重错误，可能需要跳转
 */
export type ErrorSeverity = 'silent' | 'toast' | 'modal' | 'fatal';

/** 错误上下文，自动捕获调用信息 */
export interface ErrorContext {
  /** 发生错误的页面/模块名 */
  page?: string;
  /** 触发的操作 */
  action?: string;
  /** 错误发生时间戳 */
  timestamp: number;
  /** 请求 ID，用于追踪 */
  requestId?: string;
  /** 额外元数据 */
  meta?: Record<string, unknown>;
}

export class AppError extends Error {
  severity: ErrorSeverity = 'toast';
  context: ErrorContext;
  /** 是否可恢复（可重试） */
  recoverable: boolean = false;
  /** 原始错误（链式包装时保留） */
  cause?: unknown;

  constructor(message: string, context?: Partial<ErrorContext>) {
    super(message);
    this.name = 'AppError';
    this.context = {
      timestamp: Date.now(),
      ...context,
    };
  }
}
