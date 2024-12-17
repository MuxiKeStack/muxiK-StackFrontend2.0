import { StateCreator } from 'zustand';

import { get as fetchGet } from '@/common/api/get';

import { CourseDetailSlice, CourseDetailsType, CourseInfoStore } from './types';

export const CreateCourseDetail: StateCreator<
  CourseInfoStore,
  [],
  [],
  CourseDetailSlice
> = (set, get, api) => ({
  courseDetail: {},
  fetchCouseDetail(courseId: number) {
    return fetchGet(`/courses/${courseId}/detail`).then(
      (res: { data: CourseDetailsType }) => {
        set({ courseDetail: { ...get().courseDetail, [courseId]: res.data } });
        return res.data;
      }
    );
  },
  getCourseDetail(courseId) {
    const local = get().courseDetail[courseId];
    return local
      ? Promise.resolve(local)
      : courseId
        ? get().fetchCouseDetail(courseId)
        : Promise.resolve({} as CourseDetailsType);
  },
});
