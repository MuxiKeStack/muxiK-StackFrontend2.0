import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { CommentInfo } from '@/common/types/commentTypes';
import { createTaroJSONStorage } from '@/common/utils/storage';
import { loadData } from '@/common/utils/loadData';
import { registerSessionReset } from '@/common/utils/resetSession';

import {
  applyAppendLoadResult,
  applyInitialLoadResult,
  applyRefreshResult,
  buildCacheBucket,
  invalidateStatusCache,
  moveItemInCache,
  patchLikeInCache,
  removeItemFromCache,
} from './cache';
import {
  apiToggleEvaluationStatus,
  fetchHistoryPage,
  fetchHistoryRefresh,
} from './loaders';
import type { EvaluationHistoryStore } from './types';

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
        set({ activeStatus: status });
        await get().fetchPage(false);
      },

      async fetchPage(append) {
        if (fetchInFlight) return [];
        fetchInFlight = true;
        const { activeStatus, cache } = get();
        const cached = cache[activeStatus];
        const curLastId = append ? (cached?.lastId ?? 0) : 0;

        set({ loading: append ? false : !(cached?.list?.length) });
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
          const next = removeItemFromCache(state.cache, status, evaluationId);
          return next ? { cache: next } : state;
        });
      },

      moveItem: (fromStatus, toStatus, evaluationId) => {
        set((state) => {
          const next = moveItemInCache(state.cache, fromStatus, toStatus, evaluationId);
          return next ? { cache: next } : state;
        });
      },

      invalidateCache: (status) => {
        set((state) => ({ cache: invalidateStatusCache(state.cache, status) }));
      },

      async load(status, curLastId, append) {
        const cached = get().cache[status];
        const result = await loadData({
          strategy: 'network-first',
          getCache: () => {
            if (append || curLastId > 0) return null;
            return cached?.list?.length ? cached.list : null;
          },
          fetch: () => fetchHistoryPage(status, curLastId),
          setCache: (list) => {
            if (list.length > 0 && !append && curLastId === 0) {
              set((state) => ({
                cache: {
                  ...state.cache,
                  [status]: buildCacheBucket(list, status),
                },
              }));
            }
          },
        });

        if (append && curLastId > 0) {
          const { cache: nextCache, merged } = applyAppendLoadResult(
            get().cache,
            status,
            cached?.list || [],
            result.data
          );
          set({ cache: nextCache, source: result.source });
          return merged;
        }

        if (!append) {
          if (result.source === 'network') {
            const nextCache =
              result.data.length > 0
                ? applyInitialLoadResult(get().cache, status, result.data)
                : {
                    ...get().cache,
                    [status]: {
                      list: [],
                      lastId: undefined,
                      hasMore: false,
                      status,
                    },
                  };
            if (nextCache) set({ cache: nextCache, source: result.source });
          } else {
            set({ source: result.source });
          }
        }
        return result.data;
      },

      async toggleStatus(evaluationId, targetStatus, currentStatus) {
        await apiToggleEvaluationStatus(evaluationId, targetStatus);
        get().moveItem(currentStatus, targetStatus, evaluationId);
      },

      refresh: async (status) => {
        try {
          const data = await fetchHistoryRefresh(status);
          const nextCache = applyRefreshResult(get().cache, status, data);
          if (nextCache) set({ cache: nextCache });
          return data;
        } catch (e) {
          console.error('[useEvaluationHistory] 刷新失败:', e);
          return get().cache[status]?.list || [];
        }
      },

      clearCache: () => set({ cache: {} }),

      patchEvaluationLike(evaluationId, willLike) {
        let patched: CommentInfo | undefined;
        set((state) => {
          const result = patchLikeInCache(state.cache, evaluationId, willLike);
          patched = result.patched;
          return result.patched ? { cache: result.cache } : state;
        });
        return patched;
      },
    }),
    {
      name: 'evaluation_history_cache',
      storage: createTaroJSONStorage(),
      partialize: (state) => ({ cache: state.cache }),
    }
  )
);

registerSessionReset(() => useEvaluationHistoryStore.getState().clearCache());
