import { create } from 'zustand';

import { getCourseDetail as getCourseDetailApi } from '@/common/request/api/courses';
import type { CourseDetailSlice, CourseDetailsType } from '@/common/types/courseType';

const MAX_COURSE_DETAILS = 100;

const pendingRequests = new Map<number, Promise<CourseDetailsType>>();

/** 课程详情实体仓：按 courseId 缓存课程名/教师/学院，首页卡片、班级页、详情页共用同一份。 */
export const useCourseStore = create<CourseDetailSlice>()((set, get) => ({
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
        console.error('[courseStore] 获取课程详情失败:', e);
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
}));
