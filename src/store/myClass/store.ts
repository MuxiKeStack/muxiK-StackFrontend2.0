import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { getUserCourses } from '@/common/request/api/courses';
import type { DataSource } from '@/common/types/loadType';
import { MyCourseProps } from '@/common/types/myCourseType';
import { loadData } from '@/common/utils/loadData';
import { registerSessionReset } from '@/common/utils/resetSession';
import { createTaroJSONStorage } from '@/common/utils/storage';

interface MyCourseStore {
  selectedYear: string;
  selectedSemester: string;
  coursesCache: Record<string, MyCourseProps[]>;
  source: DataSource | null;

  cacheCourses: (courses: MyCourseProps[], year: string, semester: string) => void;
  markCourseEvaluated: (courseId: number) => void;
  setSelectedYearAndSemester: (year: string, semester: string) => void;
  load: (
    year: string,
    semester: string,
    query: { yearValue: string; termValue: string },
    options?: { force?: boolean }
  ) => Promise<MyCourseProps[]>;
  clearAllCache: () => void;
  reset: () => void;
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

      markCourseEvaluated: (courseId) => {
        set((state) => {
          let changed = false;
          const coursesCache = Object.fromEntries(
            Object.entries(state.coursesCache).map(([key, courses]) => {
              const next = courses.map((course) => {
                if (course.id !== courseId || course.evaluated) return course;
                changed = true;
                return { ...course, evaluated: true };
              });
              return [key, next];
            })
          );
          return changed ? { coursesCache } : state;
        });
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

      clearAllCache: () => {
        set({ coursesCache: {}, selectedYear: '', selectedSemester: '' });
      },

      reset: () => {
        set({
          coursesCache: {},
          selectedYear: '',
          selectedSemester: '',
          source: null,
        });
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

registerSessionReset(() => useMyClassStore.getState().reset());
