/** 数据加载策略 */
export type LoadStrategy = 'cache-first' | 'network-first' | 'network-only';

/** 本次数据的来源 */
export type DataSource = 'network' | 'cache' | 'fallback';

export interface LoadResult<T> {
  data: T;
  source: DataSource;
}
