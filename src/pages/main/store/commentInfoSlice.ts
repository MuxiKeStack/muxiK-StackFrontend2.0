/* eslint-disable @typescript-eslint/no-unsafe-member-access */

/* eslint-disable @typescript-eslint/no-floating-promises */
import Taro from '@tarojs/taro';
import { StateCreator } from 'zustand';

import { get as fetchGet } from '@/common/api/get';
import { CommentInfo } from '@/common/assets/types';

import { CommentInfoSlice, COURSE_TYPE, CourseInfoStore } from './types';

export const CreateCommentInfo: StateCreator<
  CourseInfoStore,
  [],
  [],
  CommentInfoSlice
> = (set, get, api) => ({
  comments: {
    CoursePropertyGeneralCore: [],
    CoursePropertyGeneralElective: [],
    CoursePropertyGeneralRequired: [],
    CoursePropertyMajorCore: [],
  },
  currentId: 0,
  pageSize: 10,
  loading: true,
  classType: COURSE_TYPE.GENERAL_CORE,
  async refershComments() {
    return await get().updateComments(0);
  },
  async loadMoreComments() {
    const { currentId, updateComments } = get();
    return await updateComments(currentId);
  },
  async updateComments(currentId: number) {
    const { pageSize, classType, comments } = get();
    set({ loading: true });
    return await fetchGet(
      `/evaluations/list/all?cur_evaluation_id=${currentId}&limit=${pageSize}&property=${classType}`
      // 懒得写类型了，烂完了
    ).then((res: { data: CommentInfo[] }) => {
      const resDataList = res?.data?.sort((a, b) => b.id! - a.id!);
      const prevId = resDataList.at(-1)?.id;

      set((state) => {
        if (!resDataList.length) {
          Taro.showToast({
            title: '没有更多了',
          });
          return { comments: state.comments };
        }

        return {
          comments: {
            ...comments,
            [classType]: currentId
              ? state.comments[classType]
                  .concat(resDataList)
                  .sort((a, b) => b.id! - a.id!)
              : resDataList,
          },
          currentId: prevId,
          loading: false,
        };
      });
    });
  },
  changeType: (classType) => set({ classType }),
});
