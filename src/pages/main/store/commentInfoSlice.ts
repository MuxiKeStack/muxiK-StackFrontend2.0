/* eslint-disable @typescript-eslint/no-floating-promises */
import Taro from '@tarojs/taro';
import { StateCreator } from 'zustand';

import { get as fetchGet } from '@/common/api/get';

import { COMMENT_ACTIONS, CommentInfoSlice, COURSE_TYPE, CourseInfoStore } from './types';

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
  getComment(id) {
    const { classType, comments } = get();
    return comments[classType].find((item) => item.id === id);
  },
  async loadMoreComments() {
    const { currentId, updateComments } = get();
    return await updateComments(currentId);
  },
  updateCommentInfo(currentId: number, action) {
    const { comments, classType } = get();
    const currentCourses = JSON.parse(
      JSON.stringify(comments[classType])
    ) as CommentInfo[];
    const currentSelect = currentCourses.find((course) => course.id === currentId);
    if (currentSelect) {
      switch (action) {
        case COMMENT_ACTIONS.COMMENT:
          currentSelect.total_comment_count! += 1;
          break;
        case COMMENT_ACTIONS.LIKE:
          currentSelect.total_support_count! += 1;
          currentSelect.stance = 1;
          break;
        case COMMENT_ACTIONS.DISLIKE:
          currentSelect.total_support_count! -= 1;
          currentSelect.stance = 0;
          break;
        case COMMENT_ACTIONS.REMOVE_COMMENT:
          currentSelect.total_comment_count! -= 1;
          break;
      }
    }
    set((state) => ({
      comments: { ...state.comments, [classType]: currentCourses },
    }));
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
