import { AppError } from './AppError';

/** 内置处理器优先级常量 */
export const HandlerPriority = {
  AUTH: 10,
  RETRY: 20,
  TOAST: 50,
  LOG: 100,
} as const;

/**
 * 错误处理上下文（在管道中传递）
 * 每个 handler 接收此对象，可调用 stop() 终止后续处理
 */
export class HandlerContext {
  error: AppError;
  private _stopped = false;

  constructor(error: AppError) {
    this.error = error;
  }

  /** 终止管道，后续 handler 不再执行 */
  stop(): void {
    this._stopped = true;
  }

  get stopped(): boolean {
    return this._stopped;
  }
}

/** 错误处理器函数签名 */
export type ErrorHandler = (ctx: HandlerContext) => void | Promise<void>;

interface HandlerEntry {
  handler: ErrorHandler;
  priority: number;
  id: string;
}

export class ErrorPipeline {
  private handlers: HandlerEntry[] = [];
  private idCounter = 0;

  /**
   * 注册错误处理器
   * @param handler - 处理函数
   * @param priority - 数字越小越先执行，默认 100。
   *   内置: auth=10, retry=20, toast=50, log=100
   *   业务方可插入任意位置
   * @returns handlerId，用于 remove
   */
  use(handler: ErrorHandler, priority: number = 100): string {
    const id = `h_${++this.idCounter}_${priority}`;
    this.handlers.push({ handler, priority, id });
    this.handlers.sort((a, b) => a.priority - b.priority);
    return id;
  }

  /** 移除处理器 */
  remove(id: string): boolean {
    const idx = this.handlers.findIndex((h) => h.id === id);
    if (idx >= 0) {
      this.handlers.splice(idx, 1);
      return true;
    }
    return false;
  }

  /** 执行管道：依次调用所有 handler，遇到 stop() 终止 */
  async handle(error: unknown): Promise<void> {
    if (!(error instanceof AppError)) {
      // 非 AppError 的未知错误，包装后处理
      const wrapped = new AppError(error instanceof Error ? error.message : '未知错误');
      wrapped.cause = error;
      const ctx = new HandlerContext(wrapped);
      for (const entry of this.handlers) {
        await entry.handler(ctx);
        if (ctx.stopped) break;
      }
      return;
    }

    const ctx = new HandlerContext(error);
    for (const entry of this.handlers) {
      await entry.handler(ctx);
      if (ctx.stopped) break;
    }
  }
}
