/* eslint-disable @typescript-eslint/no-floating-promises */
import Taro from '@tarojs/taro';
import { StateCreator } from 'zustand';

import { get as fetchGet } from '@/common/api/get';
import { post } from '@/common/utils';

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
    if (id === 0) return undefined;
    const { classType, comments } = get();
    return comments[classType].find((item) => item.id === id);
  },
  async loadMoreComments() {
    const { currentId, updateComments } = get();
    return await updateComments(currentId);
  },
  async enrose(id, action) {
    void Taro.showLoading({
      title: '点赞中',
    });
    const shouldSupport = action === COMMENT_ACTIONS.LIKE;
    await post(`/evaluations/${id}/endorse`, {
      stance: shouldSupport ? 1 : 0,
    })
      .then(() => {
        Taro.hideLoading();
        void Taro.showToast({
          title: !shouldSupport ? '取消成功' : '点赞成功',
          icon: 'success',
          duration: 600,
        });
      })
      .catch(() => {
        Taro.hideLoading();
        void Taro.showToast({
          title: '服务端错误',
          icon: 'error',
        });
        return undefined;
      });
    const curInfo = await fetchGet(`/evaluations/${id}/detail`).then(
      (res: { data: CommentInfo }) => {
        Taro.hideLoading();
        return res.data;
      }
    );
    get().updateCommentInfo(id, curInfo);
    return curInfo;
  },
  async comment({
    id: biz_id,
    biz,
    action,
    parentId: parent_id,
    rootId: root_id,
    content,
  }) {
    Taro.showLoading({
      title: '发布课评中',
    });
    await post('/comments/publish', {
      biz,
      biz_id,
      content,
      parent_id,
      root_id,
    }).catch(() => {
      Taro.hideLoading();
      Taro.showToast({
        title: '课评发布失败',
        icon: 'error',
      });
      return;
    });
    Taro.hideLoading();
    Taro.showToast({
      title: '课评发布成功',
      icon: 'success',
    });
    const curInfo = await fetchGet(`/evaluations/${biz_id}/detail`).then(
      (res: { data: CommentInfo }) => {
        Taro.hideLoading();
        return res.data;
      }
    );
    get().updateCommentInfo(biz_id, curInfo);
    return curInfo;
  },
  updateCommentInfo(currentId: number, info: CommentInfo) {
    const { comments, classType } = get();
    const currentCourses = JSON.parse(
      JSON.stringify(comments[classType])
    ) as CommentInfo[];
    const currentSelectIndex: number = currentCourses.findIndex(
      (course) => course.id === currentId
    );
    currentSelectIndex !== -1 && (currentCourses[currentSelectIndex] = info);
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
        const currentComments = currentId
          ? state.comments[classType].concat(resDataList).sort((a, b) => b.id! - a.id!)
          : resDataList;
        return {
          comments: {
            ...comments,
            [classType]: currentComments,
          },
          currentId: prevId,
          loading: false,
        };
      });
    });
  },
  changeType: (classType) =>
    set({
      classType,
    }),
});
