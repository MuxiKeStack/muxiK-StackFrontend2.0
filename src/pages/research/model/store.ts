import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import {
  deleteSearchHistory,
  getSearchHistory,
} from '@/common/request/api/research';
import type { DataSource } from '@/common/types/loadType';
import { loadData } from '@/common/utils/loadData';
import { registerSessionReset } from '@/common/utils/resetSession';
import { createTaroJSONStorage } from '@/common/utils/storage';
import type { SearchHistoryItem, SearchResultCourse } from '@/pages/research/types';

import { fetchSearchPage } from './load';
import {
  emptySession,
  hasMoreFromPage,
  mergeResults,
  SEARCH_LOCATION,
  type SearchLocation,
  type SearchSession,
} from './searchSession';

interface ResearchStore {
  history: SearchHistoryItem[];
  historySource: DataSource | null;
  sessions: Partial<Record<SearchLocation, SearchSession>>;
  keyword: string;
  showResults: boolean;

  loadHistory: () => Promise<SearchHistoryItem[]>;
  clearHistory: () => Promise<void>;
  setKeyword: (keyword: string) => void;
  collapseResults: () => void;
  getSession: (search_location: SearchLocation) => SearchSession;
  searchFirst: (
    keyword: string,
    options?: { search_location?: SearchLocation }
  ) => Promise<SearchResultCourse[]>;
  loadMore: (options?: { search_location?: SearchLocation }) => Promise<SearchResultCourse[]>;
  refreshSearch: (options?: { search_location?: SearchLocation }) => Promise<SearchResultCourse[]>;
  resetSession: (search_location: SearchLocation) => void;
  clearUserData: () => void;
  searchHome: (keyword: string) => Promise<SearchResultCourse[]>;
}

function locationOf(options?: { search_location?: SearchLocation }): SearchLocation {
  return options?.search_location ?? SEARCH_LOCATION.HOME;
}

function patchSession(
  location: SearchLocation,
  patch: Partial<SearchSession> | ((session: SearchSession) => Partial<SearchSession>)
) {
  return (state: ResearchStore): Partial<ResearchStore> => {
    const current = state.sessions[location] ?? emptySession();
    const nextPatch = typeof patch === 'function' ? patch(current) : patch;
    return {
      sessions: {
        ...state.sessions,
        [location]: { ...current, ...nextPatch },
      },
    };
  };
}

export const useResearchStore = create<ResearchStore>()(
  persist(
    (set, get) => ({
      history: [],
      historySource: null,
      sessions: {},
      keyword: '',
      showResults: false,

      setKeyword(keyword) {
        set({ keyword });
      },

      collapseResults() {
        set({ showResults: false });
      },

      getSession(search_location) {
        return get().sessions[search_location] ?? emptySession();
      },

      resetSession(search_location) {
        set(patchSession(search_location, emptySession()));
      },

      clearUserData() {
        set({
          history: [],
          historySource: null,
          sessions: {},
          keyword: '',
          showResults: false,
        });
      },

      async loadHistory() {
        const result = await loadData({
          strategy: 'network-first',
          getCache: () => {
            const h = get().history;
            return h.length ? h : null;
          },
          fetch: async () => {
            const res = (await getSearchHistory({
              search_location: SEARCH_LOCATION.HOME,
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
          search_location: SEARCH_LOCATION.HOME,
        });
        set({ history: [], historySource: 'network' });
      },

      async searchFirst(keyword, options) {
        const location = locationOf(options);
        const trimmed = keyword.trim();
        if (!trimmed) {
          get().resetSession(location);
          return [];
        }

        const requestGen = (get().sessions[location]?.requestGen ?? 0) + 1;
        set(patchSession(location, {
          keyword: trimmed,
          results: [],
          cursor: null,
          hasMore: true,
          loading: true,
          loadingMore: false,
          refreshing: false,
          requestGen,
        }));

        try {
          const page = await fetchSearchPage(trimmed, location);
          if (get().sessions[location]?.requestGen !== requestGen) return [];

          const hasMore = hasMoreFromPage(page.courses, page.nextAfter);
          set(patchSession(location, {
            results: page.courses,
            cursor: page.nextAfter,
            hasMore,
            loading: false,
          }));
          return page.courses;
        } catch (e) {
          if (get().sessions[location]?.requestGen === requestGen) {
            set(patchSession(location, { loading: false, hasMore: false }));
          }
          throw e;
        }
      },

      async loadMore(options) {
        const location = locationOf(options);
        const session = get().getSession(location);
        if (
          !session.keyword ||
          !session.hasMore ||
          session.loading ||
          session.loadingMore ||
          !session.cursor
        ) {
          return session.results;
        }

        const { requestGen, keyword, cursor, results } = session;
        set(patchSession(location, { loadingMore: true }));

        try {
          const page = await fetchSearchPage(keyword, location, cursor);
          if (get().sessions[location]?.requestGen !== requestGen) {
            return get().getSession(location).results;
          }

          const merged = mergeResults(results, page.courses);
          const hasMore = hasMoreFromPage(page.courses, page.nextAfter);
          set(patchSession(location, {
            results: merged,
            cursor: page.nextAfter,
            hasMore,
            loadingMore: false,
          }));
          return merged;
        } catch (e) {
          set(patchSession(location, { loadingMore: false }));
          throw e;
        }
      },

      async refreshSearch(options) {
        const location = locationOf(options);
        const session = get().getSession(location);
        if (!session.keyword) return [];

        const { requestGen, keyword } = session;
        set(patchSession(location, { refreshing: true }));

        try {
          const page = await fetchSearchPage(keyword, location);
          if (get().sessions[location]?.requestGen !== requestGen) {
            return get().getSession(location).results;
          }

          const hasMore = hasMoreFromPage(page.courses, page.nextAfter);
          set(patchSession(location, {
            results: page.courses,
            cursor: page.nextAfter,
            hasMore,
            refreshing: false,
          }));
          return page.courses;
        } catch (e) {
          set(patchSession(location, { refreshing: false }));
          throw e;
        }
      },

      async searchHome(keyword) {
        const trimmed = keyword.trim();
        set({ keyword: trimmed, showResults: true });
        set((s) => {
          const filtered = s.history.filter((item) => item.keyword !== trimmed);
          return {
            history: [{ id: Date.now(), keyword: trimmed }, ...filtered].slice(0, 20),
          };
        });

        return get().searchFirst(trimmed, { search_location: SEARCH_LOCATION.HOME });
      },
    }),
    {
      name: 'research-store',
      storage: createTaroJSONStorage(),
      partialize: (state) => ({ history: state.history }),
    }
  )
);

registerSessionReset(() => useResearchStore.getState().clearUserData());
