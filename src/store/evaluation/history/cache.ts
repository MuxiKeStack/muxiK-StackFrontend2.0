import { patchCommentInfoLike } from '@/store/evaluation/shared';

import type { CommentInfo } from '@/common/types/commentTypes';

import type { EvaluationHistoryCache } from './types';
import { PAGE_SIZE } from './types';

export function removeItemFromCache(
  cache: Record<string, EvaluationHistoryCache>,
  status: string,
  evaluationId: number
): Record<string, EvaluationHistoryCache> | null {
  const current = cache[status];
  if (!current) return null;
  return {
    ...cache,
    [status]: {
      ...current,
      list: current.list.filter((item) => item.id !== evaluationId),
    },
  };
}

export function moveItemInCache(
  cache: Record<string, EvaluationHistoryCache>,
  fromStatus: string,
  toStatus: string,
  evaluationId: number
): Record<string, EvaluationHistoryCache> | null {
  const fromCache = cache[fromStatus];
  if (!fromCache) return null;

  const item = fromCache.list.find((i) => i.id === evaluationId);
  if (!item) return null;

  const toCache = cache[toStatus];
  const updatedItem = { ...item, status: toStatus };

  return {
    ...cache,
    [fromStatus]: {
      ...fromCache,
      list: fromCache.list.filter((i) => i.id !== evaluationId),
    },
    [toStatus]: {
      list: [updatedItem, ...(toCache?.list ?? [])],
      lastId: toCache?.lastId ?? (updatedItem.id as number),
      hasMore: toCache?.hasMore ?? true,
      status: toStatus,
    },
  };
}

export function invalidateStatusCache(
  cache: Record<string, EvaluationHistoryCache>,
  status: string
): Record<string, EvaluationHistoryCache> {
  const { [status]: _, ...rest } = cache;
  return rest;
}

export function buildCacheBucket(
  list: CommentInfo[],
  status: string
): EvaluationHistoryCache {
  return {
    list,
    lastId: list[list.length - 1].id!,
    hasMore: list.length >= PAGE_SIZE,
    status: status as EvaluationHistoryCache['status'],
  };
}

export function patchLikeInCache(
  cache: Record<string, EvaluationHistoryCache>,
  evaluationId: number,
  willLike: boolean
): { cache: Record<string, EvaluationHistoryCache>; patched?: CommentInfo } {
  const targetId = Number(evaluationId);
  let patched: CommentInfo | undefined;
  let changed = false;
  const nextCache = { ...cache };

  for (const status of Object.keys(nextCache)) {
    const bucket = nextCache[status];
    if (!bucket) continue;
    const idx = bucket.list.findIndex((c) => Number(c.id) === targetId);
    if (idx === -1) continue;
    const nextList = [...bucket.list];
    patched = patchCommentInfoLike(nextList[idx], willLike);
    nextList[idx] = patched;
    nextCache[status] = { ...bucket, list: nextList };
    changed = true;
  }

  return changed ? { cache: nextCache, patched } : { cache };
}

export function applyAppendLoadResult(
  cache: Record<string, EvaluationHistoryCache>,
  status: string,
  prevList: CommentInfo[],
  newData: CommentInfo[]
): { cache: Record<string, EvaluationHistoryCache>; merged: CommentInfo[] } {
  const merged = [...prevList, ...newData];
  return {
    merged,
    cache: {
      ...cache,
      [status]: {
        list: merged,
        lastId: merged[merged.length - 1]?.id,
        hasMore: newData.length >= PAGE_SIZE,
        status: status as EvaluationHistoryCache['status'],
      },
    },
  };
}

export function applyInitialLoadResult(
  cache: Record<string, EvaluationHistoryCache>,
  status: string,
  data: CommentInfo[]
): Record<string, EvaluationHistoryCache> | null {
  if (!data.length) return null;
  return { ...cache, [status]: buildCacheBucket(data, status) };
}

export function applyRefreshResult(
  cache: Record<string, EvaluationHistoryCache>,
  status: string,
  data: CommentInfo[]
): Record<string, EvaluationHistoryCache> | null {
  if (!data.length) return null;
  return {
    ...cache,
    [status]: {
      list: data,
      lastId: data[data.length - 1].id,
      hasMore: data.length >= PAGE_SIZE,
      status: status as EvaluationHistoryCache['status'],
    },
  };
}
