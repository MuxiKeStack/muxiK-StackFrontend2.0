import { create } from 'zustand';

import { CourseInfoStore } from '@/common/types/courseType';

import { CreateCourseDetail } from './detail/slice';
import { CreateCommentInfo } from './feed/slice';

export const useCourseStore = create<CourseInfoStore>()((...args) => ({
  ...CreateCommentInfo(...args),
  ...CreateCourseDetail(...args),
}));
