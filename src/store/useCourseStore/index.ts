import { create } from 'zustand';

import { CourseInfoStore } from '@/common/types/courseType';
import { CreateCommentInfo } from './commentInfoSlice';
import { CreateCourseDetail } from './courseDetailSlice';
import { CreatePublisherSlice } from './publisherInfoSlice';

export const useCourseStore = create<CourseInfoStore>()((...args) => ({
  ...CreateCommentInfo(...args),
  ...CreateCourseDetail(...args),
  ...CreatePublisherSlice(...args),
}));
