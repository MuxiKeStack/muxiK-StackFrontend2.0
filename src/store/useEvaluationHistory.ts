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
  activeStatus: EvaluationStatus;
  loading: boolean;

  setCache: (status: EvaluationStatus, data: EvaluationHistoryCache) => void;
  setActiveStatus: (status: EvaluationStatus) => Promise<void>;
  fetchPage: (append: boolean) => Promise<CommentInfo[]>;
  loadMore: () => Promise<void>;
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

/** 与 UI 的 loading 分离，避免初始 loading=true 时 fetchPage 被误挡 */
let fetchInFlight = false;

export const useEvaluationHistoryStore = create<EvaluationHistoryStore>()(
  persist(
    (set, get) => ({
      cache: {},
      source: null,
      activeStatus: 'Public',
      loading: true,

      async setActiveStatus(status) {
        if (status === get().activeStatus) return;
        const cached = get().cache[status];
        set({
          activeStatus: status,
          loading: !cached?.list?.length,
        });
        if (!cached?.list?.length) {
          await get().fetchPage(false);
        }
      },

      async fetchPage(append) {
        if (fetchInFlight) return [];
        fetchInFlight = true;
        const { activeStatus, cache } = get();
        const cached = cache[activeStatus];
        const curLastId = append ? (cached?.lastId ?? 0) : 0;

        set({ loading: true });
        try {
          return await get().load(activeStatus, curLastId, append);
        } finally {
          fetchInFlight = false;
          set({ loading: false });
        }
      },

      async loadMore() {
        const { cache, activeStatus } = get();
        const cached = cache[activeStatus];
        if (fetchInFlight || cached?.hasMore === false) return;
        await get().fetchPage(true);
      },

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
