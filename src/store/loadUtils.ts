import type { DataSource, LoadResult, LoadStrategy } from './types';

interface LoadOptions<T> {
  strategy: LoadStrategy;
  getCache: () => T | null | undefined;
  fetch: () => Promise<T>;
  setCache: (data: T) => void;
  force?: boolean;
}

export async function loadData<T>(options: LoadOptions<T>): Promise<LoadResult<T>> {
  const { strategy, getCache, fetch, setCache, force = false } = options;

  if (strategy === 'cache-first') {
    if (!force) {
      const cached = getCache();
      if (cached != null) {
        return { data: cached, source: 'cache' };
      }
    }
    const data = await fetch();
    setCache(data);
    return { data, source: 'network' };
  }

  if (strategy === 'network-first') {
    try {
      const data = await fetch();
      setCache(data);
      return { data, source: 'network' };
    } catch {
      const stale = getCache();
      if (stale != null) {
        return { data: stale, source: 'fallback' };
      }
      throw new Error('网络异常且无本地缓存');
    }
  }

  const data = await fetch();
  return { data, source: 'network' };
}

export function sourceLabel(source: DataSource | null): string | null {
  if (source === 'fallback') return '当前为离线内容';
  return null;
}
