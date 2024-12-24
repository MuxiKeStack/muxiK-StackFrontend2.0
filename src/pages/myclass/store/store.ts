import { StateCreator } from 'zustand';

const CreateCourseInfoStore: StateCreator<
  CourseInfoStore,
  [['zustand/immer', never]],
  [['zustand/immer', never]],
  CourseInfoStore
> = (...args) => ({});
