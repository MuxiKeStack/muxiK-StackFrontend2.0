import { getUserCourses } from '@/common/request/api/courses';
import { MyCourseProps } from '@/common/types/myCourseType';
import { createTaroJSONStorage } from '@/common/utils';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { loadData } from './loadUtils';
import type { DataSource } from './types';

interface MyCourseStore {
  selectedYear: string;
  selectedSemester: string;
  coursesCache: Record<string, MyCourseProps[]>;
  source: DataSource | null;

  cacheCourses: (courses: MyCourseProps[], year: string, semester: string) => void;
  setSelectedYearAndSemester: (year: string, semester: string) => void;
  load: (
    year: string,
    semester: string,
    query: { yearValue: string; termValue: string },
    options?: { force?: boolean }
  ) => Promise<MyCourseProps[]>;
  refresh: (year: string, semester: string) => Promise<void>;
  clearAllCache: () => void;
}

export const useMyClassStore = create<MyCourseStore>()(
  persist(
    (set, get) => ({
      selectedYear: '',
      selectedSemester: '',
      coursesCache: {},
      source: null,

      cacheCourses: (courses, year, semester) => {
        if (!courses.length) return;
        const key = `${year}-${semester}`;
        set((state) => ({
          coursesCache: { ...state.coursesCache, [key]: courses },
        }));
      },

      setSelectedYearAndSemester: (year, semester) => {
        set({ selectedYear: year, selectedSemester: semester });
      },

      async load(year, semester, query, options) {
        const key = `${year}-${semester}`;
        const result = await loadData({
          strategy: 'cache-first',
          force: options?.force,
          getCache: () => {
            const cached = get().coursesCache[key];
            return cached?.length ? cached : null;
          },
          fetch: async () => {
            const data = (await getUserCourses({
              year: query.yearValue,
              term: query.termValue,
            })) as MyCourseProps[];
            return Array.isArray(data) ? data : [];
          },
          setCache: (courses) => {
            if (courses.length) get().cacheCourses(courses, year, semester);
          },
        });
        set({ source: result.source });
        return result.data;
      },

      refresh: async (year, semester) => {
        try {
          const data = (await getUserCourses({
            year,
            term: semester,
          })) as MyCourseProps[];
          if (Array.isArray(data) && data.length > 0) {
            const key = `${year}-${semester}`;
            set((state) => ({
              coursesCache: { ...state.coursesCache, [key]: data },
            }));
          }
        } catch (e) {
          console.error('[useMyClasses] 刷新失败:', e);
        }
      },

      clearAllCache: () => {
        set({ coursesCache: {}, selectedYear: '', selectedSemester: '' });
      },
    }),
    {
      name: 'user_myClass_storage',
      storage: createTaroJSONStorage(),

      partialize: (state) => ({
        coursesCache: state.coursesCache,
        selectedYear: state.selectedYear,
        selectedSemester: state.selectedSemester,
      }),
    }
  )
);
