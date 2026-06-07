import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import {
  deleteSearchHistory,
  getSearchHistory,
  searchCourses,
} from '@/common/request/api/research';
import { createTaroJSONStorage } from '@/common/utils';
import type { SearchHistoryItem, SearchResultCourse } from '@/pages/research/types';

import { loadData } from './loadUtils';
import type { DataSource } from './types';

interface ResearchStore {
  history: SearchHistoryItem[];
  historySource: DataSource | null;
  searchResults: SearchResultCourse[];
  searchSource: DataSource | null;

  loadHistory: () => Promise<SearchHistoryItem[]>;
  clearHistory: () => Promise<void>;
  search: (
    keyword: string,
    options?: { search_location?: string }
  ) => Promise<SearchResultCourse[]>;
}

export const useResearchStore = create<ResearchStore>()(
  persist(
    (set, get) => ({
      history: [],
      historySource: null,
      searchResults: [],
      searchSource: null,

      async loadHistory() {
        const result = await loadData({
          strategy: 'network-first',
          getCache: () => {
            const h = get().history;
            return h.length ? h : null;
          },
          fetch: async () => {
            const res = (await getSearchHistory({
              search_location: 'Home',
            })) as SearchHistoryItem[];
            return Array.isArray(res) ? res : [];
          },
          setCache: (history) => set({ history }),
        });
        set({ history: result.data, historySource: result.source });
        return result.data;
      },

      async clearHistory() {
        await deleteSearchHistory({
          remove_all: true,
          remove_history_ids: [],
          search_location: 'Home',
        });
        set({ history: [], historySource: 'network' });
      },

      async search(keyword, options) {
        const result = await loadData({
          strategy: 'network-only',
          getCache: () => null,
          fetch: async () => {
            const data = await searchCourses({
              biz: 'Course',
              keyword,
              search_location: options?.search_location || 'Home',
            });
            return (data.courses || []) as SearchResultCourse[];
          },
          setCache: (searchResults) => set({ searchResults }),
        });
        set({ searchResults: result.data, searchSource: result.source });
        return result.data;
      },
    }),
    {
      name: 'research-store',
      storage: createTaroJSONStorage(),
      partialize: (state) => ({ history: state.history }),
    }
  )
);
