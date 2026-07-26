import { create } from 'zustand';

import { COURSE_TYPE, type classType } from '@/common/types/courseType';
import { registerSessionReset } from '@/common/utils/resetSession';

const MAX_IDS_PER_TYPE = 200;

const emptyIds = (): Record<classType, number[]> => ({
  CoursePropertyGeneralCore: [],
  CoursePropertyGeneralElective: [],
  CoursePropertyAny: [],
  CoursePropertyMajorCore: [],
  CoursePropertyGeneralRequired: [],
  CoursePropertyMajorElective: [],
});

// 首页 feed 的「视图态」:只存每个分类的课评 id 顺序 + 游标 + loading。课评数据在
interface FeedViewStore {
  idsByType: Record<classType, number[]>;
  classType: classType;
  currentId: number;
  pageSize: number;
  loading: boolean;

  setType: (t: classType) => void;
  setLoading: (b: boolean) => void;
  applyPage: (params: {
    classType: classType;
    ids: number[];
    isRefresh: boolean;
    prevId?: number;
  }) => void;
  reset: () => void;
}

export const useFeedStore = create<FeedViewStore>()((set) => ({
  idsByType: emptyIds(),
  classType: COURSE_TYPE.ANY,
  currentId: 0,
  pageSize: 6,
  loading: true,

  setType: (t) => set({ classType: t }),
  setLoading: (b) => set({ loading: b }),

  applyPage({ classType, ids, isRefresh, prevId }) {
    set((state) => {
      const existing = state.idsByType[classType] ?? [];
      const merged = isRefresh ? ids : [...new Set([...existing, ...ids])];
      const sorted = merged.sort((a, b) => b - a);
      const trimmed =
        sorted.length > MAX_IDS_PER_TYPE ? sorted.slice(0, MAX_IDS_PER_TYPE) : sorted;
      return {
        idsByType: { ...state.idsByType, [classType]: trimmed },
        currentId: prevId ?? state.currentId,
        loading: false,
      };
    });
  },

  reset: () =>
    set({
      idsByType: emptyIds(),
      classType: COURSE_TYPE.ANY,
      currentId: 0,
      loading: true,
    }),
}));

registerSessionReset(() => useFeedStore.getState().reset());
