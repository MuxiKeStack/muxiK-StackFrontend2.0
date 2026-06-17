import type { SearchResultCourse } from '@/pages/research/types';

export const SEARCH_PAGE_SIZE = 10;

export const SEARCH_LOCATION = {
  HOME: 'Home',
  COLLECTIONS: 'Collections',
} as const;

export type SearchLocation = (typeof SEARCH_LOCATION)[keyof typeof SEARCH_LOCATION];

export interface SearchCursor {
  id: number;
  score: number;
}

export interface SearchSession {
  keyword: string;
  results: SearchResultCourse[];
  cursor: SearchCursor | null;
  hasMore: boolean;
  loading: boolean;
  loadingMore: boolean;
  refreshing: boolean;
  requestGen: number;
}

export function emptySession(): SearchSession {
  return {
    keyword: '',
    results: [],
    cursor: null,
    hasMore: true,
    loading: false,
    loadingMore: false,
    refreshing: false,
    requestGen: 0,
  };
}

export function parseNextAfter(raw: unknown): SearchCursor | null {
  if (!raw || typeof raw !== 'object') return null;
  const { id, score } = raw as { id?: number; score?: number };
  if (id == null || score == null) return null;
  return { id: Number(id), score: Number(score) };
}

/** 本页满页且后端返回 next_after → 还可继续加载 */
export function hasMoreFromPage(
  courses: SearchResultCourse[],
  nextAfter: SearchCursor | null
): boolean {
  if (courses.length < SEARCH_PAGE_SIZE) return false;
  return nextAfter != null;
}

export function mergeResults(
  prev: SearchResultCourse[],
  batch: SearchResultCourse[]
): SearchResultCourse[] {
  if (!batch.length) return prev;
  const seen = new Set(prev.map((c) => c.id));
  const appended = batch.filter((c) => !seen.has(c.id));
  return [...prev, ...appended];
}
