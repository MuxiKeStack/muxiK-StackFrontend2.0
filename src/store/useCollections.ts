import { getCollectionList } from '@/common/request/api/courses';
import { CollectionProps } from '@/common/types/collectionsType';
import { createTaroJSONStorage } from '@/common/utils';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { loadData } from './loadUtils';
import type { DataSource } from './types';

interface CollectionsStore {
  collectionsCache: CollectionProps[];
  source: DataSource | null;
  setCollections: (collections: CollectionProps[]) => void;
  addCollection: (course: CollectionProps) => void;
  removeCollection: (courseId: number) => void;
  load: (
    params: { cur_collection_id: number; limit: number },
    options?: { force?: boolean }
  ) => Promise<CollectionProps[]>;
  refresh: () => Promise<void>;
  clearCache: () => void;
}

export const useMyCollectionsStore = create<CollectionsStore>()(
  persist(
    (set, get) => ({
      collectionsCache: [],
      source: null,

      setCollections: (collections) => set({ collectionsCache: collections }),

      async load(params, options) {
        const result = await loadData({
          strategy: 'cache-first',
          force: options?.force,
          getCache: () => {
            const cached = get().collectionsCache;
            return cached.length ? cached : null;
          },
          fetch: async () => {
            const data = (await getCollectionList(params)) as CollectionProps[];
            return Array.isArray(data) ? data : [];
          },
          setCache: (collections) => set({ collectionsCache: collections }),
        });
        set({ source: result.source });
        return result.data;
      },

      addCollection: (course) => {
        const { collectionsCache } = get();
        const isExist = collectionsCache.some(
          (item) => item.course_id === course.course_id
        );
        if (!isExist) {
          set({ collectionsCache: [course, ...collectionsCache] });
        }
      },

      removeCollection: (courseId) => {
        set((state) => ({
          collectionsCache: state.collectionsCache.filter(
            (item) => item.course_id !== courseId
          ),
        }));
      },

      refresh: async () => {
        try {
          const data = (await getCollectionList({
            cur_collection_id: 0,
            limit: 50,
          })) as CollectionProps[];
          if (Array.isArray(data) && data.length > 0) {
            set({ collectionsCache: data });
          }
        } catch (e) {
          console.error('[useCollections] 刷新失败:', e);
        }
      },

      clearCache: () => set({ collectionsCache: [] }),
    }),
    {
      name: 'user_collections_storage',
      storage: createTaroJSONStorage(),
      partialize: (state) => ({ collectionsCache: state.collectionsCache }),
    }
  )
);
