import type { CommentInfo } from '@/common/types/commentTypes';

type Handler<T = unknown> = (payload: T) => void;

type OffFn = () => void;

interface SubscriberDebugInfo {
  stack: string;
}

interface EventMap {
  question: {
    id?: number;
    content: string;
    biz: string;
    biz_id: number;
    answer_cnt: number;
    preview_answers: Record<string, unknown>[];
  };
  evaluation: CommentInfo & { type?: string };
  eval_item_removed: { id: number };
  notification_list: { data: unknown[]; type: string };
  feedback_detail: Record<string, unknown>;
}

class EventBus {
  private channels = new Map<keyof EventMap | string, Set<Handler>>();
  private stickyPayloads = new Map<keyof EventMap | string, unknown>();
  private handlerDebug = new Map<Handler, SubscriberDebugInfo>();

  private captureDebugInfo(): SubscriberDebugInfo {
    const stack = new Error().stack || '';
    return { stack };
  }

  on<
    K extends keyof EventMap | string,
    T = K extends keyof EventMap ? EventMap[K] : unknown,
  >(event: K, handler: Handler<T>): OffFn {
    let handlers = this.channels.get(event);
    if (!handlers) {
      handlers = new Set();
      this.channels.set(event, handlers);
    }
    handlers.add(handler as Handler);
    this.handlerDebug.set(handler as Handler, this.captureDebugInfo());

    return () => {
      handlers?.delete(handler as Handler);
      this.handlerDebug.delete(handler as Handler);
    };
  }

  off<
    K extends keyof EventMap | string,
    T = K extends keyof EventMap ? EventMap[K] : unknown,
  >(event: K, handler: Handler<T>): void {
    this.channels.get(event)?.delete(handler as Handler);
    this.handlerDebug.delete(handler as Handler);
  }

  emit<
    K extends keyof EventMap | string,
    T = K extends keyof EventMap ? EventMap[K] : unknown,
  >(event: K, payload: T): void {
    this.channels.get(event)?.forEach((fn) => fn(payload));
  }

  stickyEmit<
    K extends keyof EventMap | string,
    T = K extends keyof EventMap ? EventMap[K] : unknown,
  >(event: K, payload: T): void {
    this.stickyPayloads.set(event, payload);
    this.emit(event, payload);
  }

  onSticky<
    K extends keyof EventMap | string,
    T = K extends keyof EventMap ? EventMap[K] : unknown,
  >(event: K, handler: Handler<T>): OffFn {
    const sticky = this.stickyPayloads.get(event);
    if (sticky !== undefined) {
      handler(sticky as T);
    }
    return this.on(event, handler);
  }

  getSticky<K extends keyof EventMap | string>(
    event: K
  ): K extends keyof EventMap ? EventMap[K] | undefined : unknown | undefined {
    return this.stickyPayloads.get(event) as any;
  }

  clear(event?: string): void {
    if (event) {
      this.channels.delete(event);
      this.stickyPayloads.delete(event);
    } else {
      this.channels.clear();
      this.stickyPayloads.clear();
      this.handlerDebug.clear();
    }
  }
}

export const bus = new EventBus();
