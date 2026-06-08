import { create } from 'zustand';

import type { CommentInfo } from '@/common/types/commentTypes';

import { apiToggleCollect, fetchClassInfo, fetchCourseEvaluations } from './loaders';
import {
  patchEvaluationLikeInList,
  prependEvaluationList,
  upsertQuestionList,
} from './patch';
import type { ClassInfoStore } from './types';

export const useClassInfoStore = create<ClassInfoStore>()((set) => ({
  course: null,
  comments: [],
  grade: undefined,
  questionlist: [],
  collect: undefined,
  source: null,
  loading: false,

  async load(courseId) {
    set({ loading: true });
    try {
      const data = await fetchClassInfo(courseId);
      set({ ...data, source: 'network', loading: false });
      return data;
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },

  async refreshComments(courseId) {
    const comments = await fetchCourseEvaluations(courseId);
    set({ comments, source: 'network' });
    return comments;
  },

  async toggleCollect(courseId, collect) {
    const nextCollect = !collect;
    await apiToggleCollect(courseId, nextCollect);
    set({ collect: nextCollect });
    return nextCollect;
  },

  upsertQuestion(courseId, question) {
    set((s) => {
      const next = upsertQuestionList(s.questionlist, courseId, question);
      return next ? { questionlist: next } : s;
    });
  },

  prependEvaluation(courseId, evaluation) {
    set((s) => {
      const next = prependEvaluationList(s.comments, courseId, evaluation);
      return next ? { comments: next } : s;
    });
  },

  patchEvaluationLike(evaluationId, willLike) {
    let patched: CommentInfo | undefined;
    set((s) => {
      const result = patchEvaluationLikeInList(s.comments, evaluationId, willLike);
      patched = result.patched;
      return result.patched ? { comments: result.comments } : s;
    });
    return patched;
  },
}));
