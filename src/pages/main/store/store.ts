/* eslint-disable @typescript-eslint/no-unsafe-return */
import Taro from '@tarojs/taro';
import { create, StateCreator } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { CreateCommentInfo } from './commentInfoSlice';
import { CreateCourseDetail } from './courseDetailSlice';
import { CreatePublisherSlice } from './publisherInfoSlice';
import { CourseInfoStore } from './types';

/** 持久化 */
const storage = createJSONStorage(() => {
  const getItem = (key: string) => Taro.getStorageSync(key);
  const setItem = (key: string, value: unknown) => Taro.setStorageSync(key, value);
  const removeItem = (key: string) => Taro.removeStorageSync(key);
  return { getItem, setItem, removeItem };
});

const CreateCourseInfoStore: StateCreator<
  CourseInfoStore,
  [['zustand/immer', never]],
  [['zustand/immer', never], ['zustand/persist', unknown]],
  CourseInfoStore
> = immer(
  persist(
    (...args) => ({
      ...CreateCommentInfo(...args),
      ...CreateCourseDetail(...args),
      ...CreatePublisherSlice(...args),
    }),
    {
      name: 'courseInfo',
      storage,
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(([key]) => !['comments'].includes(key))
        ),
    }
  )
);

export const useCourseStore = create<
  CourseInfoStore,
  [['zustand/immer', never], ['zustand/persist', unknown]]
>(CreateCourseInfoStore);
