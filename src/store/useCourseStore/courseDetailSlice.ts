import { StateCreator } from 'zustand';

import { getCourseDetail as getCourseDetailApi } from '@/common/request/api/courses';

import {
  CourseDetailSlice,
  CourseDetailsType,
  CourseInfoStore,
} from '@/common/types/courseType';

const MAX_COURSE_DETAILS = 100;

const pendingRequests = new Map<number, Promise<CourseDetailsType>>();

export const CreateCourseDetail: StateCreator<
  CourseInfoStore,
  [],
  [],
  CourseDetailSlice
> = (set, get) => ({
  courseDetail: {},

  cacheCourseDetails(courses: Record<number, CourseDetailsType>) {
    const entries = Object.entries(courses);
    if (!entries.length) return;
    set((state) => {
      const next = { ...state.courseDetail, ...courses };
      const keys = Object.keys(next);
      while (keys.length > MAX_COURSE_DETAILS) {
        delete next[Number(keys.shift()!)];
      }
      return { courseDetail: next };
    });
  },

  fetchCourseDetail(courseId: number) {
    const pending = pendingRequests.get(courseId);
    if (pending) return pending;

    const promise = getCourseDetailApi(courseId)
      .then((res: CourseDetailsType) => {
        set((state) => {
          const next = { ...state.courseDetail, [courseId]: res };
          const keys = Object.keys(next);
          if (keys.length > MAX_COURSE_DETAILS) {
            delete next[Number(keys[0])];
          }
          return { courseDetail: next };
        });
        return res;
      })
      .catch((e) => {
        console.error('[courseDetailSlice] 获取课程详情失败:', e);
        throw e;
      })
      .finally(() => {
        pendingRequests.delete(courseId);
      });

    pendingRequests.set(courseId, promise);
    return promise;
  },

  getCourseDetail(courseId) {
    if (!courseId) return Promise.resolve(null);
    const local = get().courseDetail[courseId];
    return local ? Promise.resolve(local) : get().fetchCourseDetail(courseId);
  },
});
