import type { ErrorHandler } from '../errors/ErrorPipeline';
import { ErrorPipeline, HandlerPriority } from '../errors/ErrorPipeline';
import { authHandler } from './authHandler';
import { logHandler } from './logHandler';
import { toastHandler } from './toastHandler';

// 全局错误处理器单例，在 app 启动时自动初始化，注册内置 handler
class GlobalErrorHandler {
  private pipeline: ErrorPipeline;
  private initialized = false;

  constructor() {
    this.pipeline = new ErrorPipeline();
  }

  // 初始化内置处理器
  init(): void {
    if (this.initialized) return;
    this.initialized = true;

    this.pipeline.use(authHandler, HandlerPriority.AUTH);
    this.pipeline.use(toastHandler, HandlerPriority.TOAST);
    this.pipeline.use(logHandler, HandlerPriority.LOG);
  }

  use(handler: ErrorHandler, priority?: number): string {
    return this.pipeline.use(handler, priority);
  }

  remove(id: string): boolean {
    return this.pipeline.remove(id);
  }

  async handle(error: unknown): Promise<void> {
    this.init();
    await this.pipeline.handle(error);
  }
}

export const globalErrorHandler = new GlobalErrorHandler();
