import { StateCreator } from 'zustand';

import { patchCommentInfoLike } from '@/store/evaluation/shared';

import { publishComment } from '@/common/request/api/comments';
import type { CommentInfo, CommentType } from '@/common/types/commentTypes';
import {
  CommentInfoSlice,
  COURSE_TYPE,
  CourseInfoStore,
  classType,
} from '@/common/types/courseType';

const MAX_COMMENTS_PER_TYPE = 200;

export const CreateCommentInfo: StateCreator<
  CourseInfoStore,
  [],
  [],
  CommentInfoSlice
> = (set, get) => ({
  comments: {
    CoursePropertyGeneralCore: [],
    CoursePropertyGeneralElective: [],
    CoursePropertyAny: [],
    CoursePropertyMajorCore: [],
    CoursePropertyGeneralRequired: [],
    CoursePropertyMajorElective: [],
  },
  currentId: 0,
  pageSize: 6,
  loading: true,
  classType: COURSE_TYPE.ANY,
  lastSource: null,

  getComment(id) {
    if (id === 0) return undefined;
    const { classType, comments } = get();
    return comments[classType].find((item) => item.id === id);
  },

  applyFeedPage({ classType, resDataList, currentId, existingList, prevId }) {
    set((state) => {
      const merged = currentId
        ? [...existingList, ...resDataList].sort((a, b) => (b.id ?? 0) - (a.id ?? 0))
        : resDataList;
      const trimmed =
        merged.length > MAX_COMMENTS_PER_TYPE
          ? merged.slice(0, MAX_COMMENTS_PER_TYPE)
          : merged;
      return {
        comments: { ...state.comments, [classType]: trimmed },
        currentId: prevId ?? state.currentId,
        loading: false,
        lastSource: 'network',
      };
    });
  },

  patchEvaluationLike(evaluationId, willLike) {
    const targetId = Number(evaluationId);
    let patched: CommentInfo | undefined;
    set((state) => {
      const nextComments = { ...state.comments };
      for (const key of Object.keys(nextComments) as Array<keyof typeof nextComments>) {
        const list = nextComments[key];
        const idx = list.findIndex((c) => Number(c.id) === targetId);
        if (idx === -1) continue;
        const updated = [...list];
        patched = patchCommentInfoLike(updated[idx], willLike);
        updated[idx] = patched;
        nextComments[key] = updated;
        return { comments: nextComments };
      }
      return state;
    });
    return patched;
  },

  async comment({ id: biz_id, biz, parentId: parent_id, rootId: root_id, content }) {
    const publishRes = await publishComment({
      biz,
      biz_id,
      content,
      parent_id,
      root_id,
    });
    const localInfo = get().getComment(biz_id);
    if (localInfo) {
      const updated: CommentInfo = {
        ...localInfo,
        total_comment_count: (localInfo.total_comment_count || 0) + 1,
      };
      get().updateCommentInfo(biz_id, updated);
    }
    return publishRes as CommentType;
  },

  updateCommentInfo(currentId, info) {
    const { comments, classType } = get();
    const currentCourses = [...comments[classType]];
    const idx = currentCourses.findIndex((course) => course.id === currentId);
    if (idx !== -1) currentCourses[idx] = info;
    set({ comments: { ...get().comments, [classType]: currentCourses } });
  },

  incrementEvaluationCommentCount(evaluationId, delta = 1) {
    if (!evaluationId) return undefined;
    const targetId = Number(evaluationId);
    let patched: CommentInfo | undefined;
    set((state) => {
      const nextComments = { ...state.comments };
      for (const key of Object.keys(nextComments) as Array<keyof typeof nextComments>) {
        const list = nextComments[key];
        const idx = list.findIndex((c) => Number(c.id) === targetId);
        if (idx === -1) continue;
        const updated = [...list];
        const before = updated[idx].total_comment_count || 0;
        patched = {
          ...updated[idx],
          total_comment_count: before + delta,
        };
        updated[idx] = patched;
        nextComments[key] = updated;
        return { comments: nextComments };
      }
      return state;
    });
    return patched;
  },

  changeType: (nextType: classType) => set({ classType: nextType }),
});
