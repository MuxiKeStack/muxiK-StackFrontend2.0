import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { getMatchLabels } from '@/common/request/api/statics';
import { createTaroJSONStorage } from '@/common/utils';

import { loadData } from './loadUtils';
import type { DataSource } from './types';

export interface GuideLabelItem {
  name: string;
  content: string;
  labels: { year?: string; term?: string; type?: string };
}

interface GuideStore {
  labels: GuideLabelItem[];
  source: DataSource | null;
  loadLabels: () => Promise<GuideLabelItem[]>;
  filterLabels: (year: string, term: string) => { name: string; content: string }[];
}

export const useGuideStore = create<GuideStore>()(
  persist(
    (set, get) => ({
      labels: [],
      source: null,

      async loadLabels() {
        const result = await loadData({
          strategy: 'cache-first',
          getCache: () => {
            const list = get().labels;
            return list.length ? list : null;
          },
          fetch: async () => {
            const res = (await getMatchLabels({
              ['labels[type]']: '选课手册',
            })) as GuideLabelItem[];
            return Array.isArray(res) ? res : [];
          },
          setCache: (labels) => set({ labels }),
        });
        set({ labels: result.data, source: result.source });
        return result.data;
      },

      filterLabels(year, term) {
        let filtered = get().labels;
        if (year !== '全部' || term !== '全部') {
          if (year !== '全部' && term !== '全部') {
            filtered = filtered.filter(
              (item) => item.labels.year === year && item.labels.term === term
            );
          } else if (year === '全部') {
            filtered = filtered.filter((item) => item.labels.term === term);
          } else if (term === '全部') {
            filtered = filtered.filter((item) => item.labels.year === year);
          }
        }
        return filtered.map((item) => ({ name: item.name, content: item.content }));
      },
    }),
    {
      name: 'guide-store',
      storage: createTaroJSONStorage(),
      partialize: (state) => ({ labels: state.labels }),
    }
  )
);
