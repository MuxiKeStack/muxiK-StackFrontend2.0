import { create } from 'zustand';

import { getQuestionBucket, patchQuestionBucket } from '../shared/types';
import { fetchAnswers, fetchQuestion, submitAnswer } from './loaders';
import { buildOptimisticAnswer, confirmOptimisticQuestion } from './optimistic';
import type { AnswerDetail, QuestionDetail, QuestionDetailStore } from './types';

const answersLoadGen: Record<number, number> = {};

export const useQuestionDetailStore = create<QuestionDetailStore>()((set, get) => ({
  activeQuestionId: null,
  buckets: {},
  source: null,

  async loadQuestion(questionId) {
    const question = await fetchQuestion(questionId);
    set((s) => ({
      activeQuestionId: questionId,
      buckets: patchQuestionBucket(s.buckets, questionId, { question }),
      source: 'network',
    }));
    return question;
  },

  async loadAnswers(questionId) {
    answersLoadGen[questionId] = (answersLoadGen[questionId] ?? 0) + 1;
    const gen = answersLoadGen[questionId];

    const list = await fetchAnswers(questionId, 0, 20);
    set((s) => {
      if (gen !== answersLoadGen[questionId]) return s;
      return {
        activeQuestionId: questionId,
        buckets: patchQuestionBucket(s.buckets, questionId, {
          answers: list,
          lastAnswerId: list.length > 0 ? list[list.length - 1].id : 0,
          answersHasMore: list.length >= 20,
          answersLoaded: true,
        }),
        source: 'network',
      };
    });
    return list;
  },

  async loadMoreAnswers(questionId) {
    const bucket = getQuestionBucket(get().buckets, questionId);
    const list = await fetchAnswers(questionId, bucket.lastAnswerId, 10);
    set((s) => {
      const prev = getQuestionBucket(s.buckets, questionId);
      const merged = [...prev.answers, ...list];
      return {
        buckets: patchQuestionBucket(s.buckets, questionId, {
          answers: merged,
          answersHasMore: list.length >= 10,
          lastAnswerId: list.length > 0 ? list[list.length - 1].id : prev.lastAnswerId,
        }),
        source: 'network',
      };
    });
    return getQuestionBucket(get().buckets, questionId).answers;
  },

  publishReply(questionId, content) {
    return submitAnswer(questionId, content);
  },

  addOptimisticAnswer({ questionId, content, publisher }) {
    const optimisticId = -Date.now();
    const newAnswer = buildOptimisticAnswer({ optimisticId, questionId, content, publisher });
    set((s) => {
      const bucket = getQuestionBucket(s.buckets, questionId);
      return {
        buckets: patchQuestionBucket(s.buckets, questionId, {
          answers: [newAnswer, ...bucket.answers],
        }),
      };
    });
    return optimisticId;
  },

  confirmOptimisticAnswer(optimisticId, questionId) {
    const bucket = getQuestionBucket(get().buckets, questionId);
    if (!bucket.question) return null;
    const updated = confirmOptimisticQuestion(bucket.question, bucket.answers, optimisticId);
    set((s) => ({
      buckets: patchQuestionBucket(s.buckets, questionId, { question: updated }),
    }));
    return updated;
  },

  removeOptimisticAnswer(optimisticId, questionId) {
    set((s) => {
      const bucket = getQuestionBucket(s.buckets, questionId);
      return {
        buckets: patchQuestionBucket(s.buckets, questionId, {
          answers: bucket.answers.filter((a) => a.id !== optimisticId),
        }),
      };
    });
  },
}));
