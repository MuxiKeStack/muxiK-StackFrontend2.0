/* eslint-disable @typescript-eslint/no-unsafe-return */
import { create, StateCreator } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { CreateCommentInfo } from './commentInfoSlice';
import { CreateCourseDetail } from './courseDetailSlice';
import { CreatePublisherSlice } from './publisherInfoSlice';
import { CourseInfoStore } from './types';

const CreateCourseInfoStore: StateCreator<
  CourseInfoStore,
  [['zustand/immer', never]],
  [['zustand/immer', never]],
  CourseInfoStore
> = immer((...args) => ({
  ...CreateCommentInfo(...args),
  ...CreateCourseDetail(...args),
  ...CreatePublisherSlice(...args),
}));

export const useCourseStore = create<CourseInfoStore, [['zustand/immer', never]]>(
  CreateCourseInfoStore
);
