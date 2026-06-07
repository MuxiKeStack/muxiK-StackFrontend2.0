import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { EvaluationStatus } from '@/common/request/api/evaluations';
import {
  getEvaluationHistory,
  toggleEvaluationStatus,
} from '@/common/request/api/evaluations';
import type { CommentInfo } from '@/common/types/commentTypes';
import { createTaroJSONStorage } from '@/common/utils';

import { loadData } from './loadUtils';
import type { DataSource } from './types';

export interface EvaluationHistoryCache {
  list: CommentInfo[];
  lastId: number | undefined;
  hasMore: boolean;
  status: EvaluationStatus;
}

interface EvaluationHistoryStore {
  cache: Record<string, EvaluationHistoryCache>;
  source: DataSource | null;

  setCache: (status: EvaluationStatus, data: EvaluationHistoryCache) => void;
  load: (
    status: EvaluationStatus,
    curLastId: number,
    append: boolean,
    options?: { force?: boolean }
  ) => Promise<CommentInfo[]>;
  toggleStatus: (
    evaluationId: number,
    targetStatus: EvaluationStatus,
    currentStatus: EvaluationStatus
  ) => Promise<void>;
  removeItem: (status: EvaluationStatus, evaluationId: number) => void;
  moveItem: (
    fromStatus: EvaluationStatus,
    toStatus: EvaluationStatus,
    evaluationId: number
  ) => void;
  invalidateCache: (status: EvaluationStatus) => void;
  refresh: (status: EvaluationStatus) => Promise<CommentInfo[]>;
  clearCache: () => void;
}

const PAGE_SIZE = 10;

export const useEvaluationHistoryStore = create<EvaluationHistoryStore>()(
  persist(
    (set, get) => ({
      cache: {},
      source: null,

      setCache: (status, data) => {
        if (!data.list?.length) return;
        set((state) => ({
          cache: { ...state.cache, [status]: data },
        }));
      },

      removeItem: (status, evaluationId) => {
        set((state) => {
          const current = state.cache[status];
          if (!current) return state;

          return {
            cache: {
              ...state.cache,
              [status]: {
                ...current,
                list: current.list.filter((item) => item.id !== evaluationId),
              },
            },
          };
        });
      },

      moveItem: (fromStatus, toStatus, evaluationId) => {
        set((state) => {
          const fromCache = state.cache[fromStatus];
          if (!fromCache) return state;

          const item = fromCache.list.find((i) => i.id === evaluationId);
          if (!item) return state;

          const toCache = state.cache[toStatus];
          const updatedItem = { ...item, status: toStatus };

          return {
            cache: {
              ...state.cache,
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
            },
          };
        });
      },

      invalidateCache: (status) => {
        set((state) => {
          const { [status]: _, ...rest } = state.cache;
          return { cache: rest };
        });
      },

      async load(status, curLastId, append, options) {
        const cached = get().cache[status];
        const result = await loadData({
          strategy: 'cache-first',
          force: options?.force || append || curLastId > 0,
          getCache: () => {
            if (append || curLastId > 0) return null;
            return cached?.list?.length ? cached.list : null;
          },
          fetch: async () => {
            const res = await getEvaluationHistory({
              cur_evaluation_id: curLastId || undefined,
              limit: PAGE_SIZE,
              status,
            });
            return (Array.isArray(res) ? res : []) as CommentInfo[];
          },
          setCache: (list) => {
            if (list.length > 0 && !append && curLastId === 0) {
              set((state) => ({
                cache: {
                  ...state.cache,
                  [status]: {
                    list,
                    lastId: list[list.length - 1].id!,
                    hasMore: list.length >= PAGE_SIZE,
                    status,
                  },
                },
              }));
            }
          },
        });

        if (append && curLastId > 0) {
          const prev = cached?.list || [];
          const merged = [...prev, ...result.data];
          set((state) => ({
            cache: {
              ...state.cache,
              [status]: {
                list: merged,
                lastId: merged[merged.length - 1]?.id,
                hasMore: result.data.length >= PAGE_SIZE,
                status,
              },
            },
            source: result.source,
          }));
          return merged;
        }

        if (!append && result.data.length > 0) {
          set((state) => ({
            cache: {
              ...state.cache,
              [status]: {
                list: result.data,
                lastId: result.data[result.data.length - 1].id!,
                hasMore: result.data.length >= PAGE_SIZE,
                status,
              },
            },
            source: result.source,
          }));
        } else {
          set({ source: result.source });
        }
        return result.data;
      },

      async toggleStatus(evaluationId, targetStatus, currentStatus) {
        await toggleEvaluationStatus(evaluationId, { status: targetStatus });
        get().moveItem(currentStatus, targetStatus, evaluationId);
      },

      refresh: async (status) => {
        try {
          const res = await getEvaluationHistory({
            cur_evaluation_id: undefined,
            limit: PAGE_SIZE,
            status,
          });
          const data = (Array.isArray(res) ? res : []) as CommentInfo[];
          if (data.length > 0) {
            set((state) => ({
              cache: {
                ...state.cache,
                [status]: {
                  list: data,
                  lastId: data[data.length - 1].id,
                  hasMore: data.length >= PAGE_SIZE,
                  status,
                },
              },
            }));
          }
          return data;
        } catch (e) {
          console.error('[useEvaluationHistory] 刷新失败:', e);
          return get().cache[status]?.list || [];
        }
      },

      clearCache: () => set({ cache: {} }),
    }),
    {
      name: 'evaluation_history_cache',
      storage: createTaroJSONStorage(),
      partialize: (state) => ({ cache: state.cache }),
    }
  )
);
