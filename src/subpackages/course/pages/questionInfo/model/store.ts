import { create } from 'zustand';

import { registerSessionReset } from '@/common/utils/resetSession';

import { fetchAnswers, fetchQuestion, submitAnswer } from './api';
import type { QuestionDetailStore } from './types';
import {
  applyAnswerToQuestion,
  createPendingAnswer,
  getQuestionEntry,
  patchQuestionEntry,
} from './utils';

const answersLoadGen: Record<number, number> = {};

export const useQuestionDetailStore = create<QuestionDetailStore>()((set, get) => ({
  activeQuestionId: null,
  byId: {},
  source: null,

  async loadQuestion(questionId) {
    const question = await fetchQuestion(questionId);
    set((s) => ({
      activeQuestionId: questionId,
      byId: patchQuestionEntry(s.byId, questionId, { question }),
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
        byId: patchQuestionEntry(s.byId, questionId, {
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
    const entry = getQuestionEntry(get().byId, questionId);
    const list = await fetchAnswers(questionId, entry.lastAnswerId, 10);
    set((s) => {
      const prev = getQuestionEntry(s.byId, questionId);
      const merged = [...prev.answers, ...list];
      return {
        byId: patchQuestionEntry(s.byId, questionId, {
          answers: merged,
          answersHasMore: list.length >= 10,
          lastAnswerId: list.length > 0 ? list[list.length - 1].id : prev.lastAnswerId,
        }),
        source: 'network',
      };
    });
    return getQuestionEntry(get().byId, questionId).answers;
  },

  publishReply(questionId, content) {
    return submitAnswer(questionId, content);
  },

  addPendingAnswer({ questionId, content, publisher }) {
    const tempId = -Date.now();
    const newAnswer = createPendingAnswer({ tempId, questionId, content, publisher });
    set((s) => {
      const entry = getQuestionEntry(s.byId, questionId);
      return {
        byId: patchQuestionEntry(s.byId, questionId, {
          answers: [newAnswer, ...entry.answers],
        }),
      };
    });
    return tempId;
  },

  confirmPendingAnswer(tempId, questionId) {
    const entry = getQuestionEntry(get().byId, questionId);
    if (!entry.question) return null;
    const updated = applyAnswerToQuestion(entry.question, entry.answers, tempId);
    set((s) => ({
      byId: patchQuestionEntry(s.byId, questionId, { question: updated }),
    }));
    return updated;
  },

  removePendingAnswer(tempId, questionId) {
    set((s) => {
      const entry = getQuestionEntry(s.byId, questionId);
      return {
        byId: patchQuestionEntry(s.byId, questionId, {
          answers: entry.answers.filter((a) => a.id !== tempId),
        }),
      };
    });
  },

  reset() {
    for (const key of Object.keys(answersLoadGen)) {
      delete answersLoadGen[Number(key)];
    }
    set({ activeQuestionId: null, byId: {}, source: null });
  },
}));

registerSessionReset(() => useQuestionDetailStore.getState().reset());
