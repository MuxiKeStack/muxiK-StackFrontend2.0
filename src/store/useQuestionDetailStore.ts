import { create } from 'zustand';

import { useCourseStore } from '@/store/useCourseStore';

import { getAnswersList, publishAnswer } from '@/common/request/api/answers';
import { getQuestionDetail } from '@/common/request/api/questions';

import type { DataSource } from './types';

export interface QuestionDetail {
  id: number;
  questioner_id: number;
  biz: string;
  biz_id: number;
  content: string;
  answer_cnt: number;
  preview_answers: null | Array<{ id: number; content: string }>;
  utime: number;
  ctime: number;
}

export interface AnswerDetail {
  id: number;
  publisher_id: number;
  question_id: number;
  content: string;
  stance: number;
  total_support_count: number;
  total_comment_count: number;
  utime: number;
  ctime: number;
  publisher?: {
    id: number;
    avatar: string;
    nickname: string;
    using_title?: string;
    level?: number;
  };
}

interface QuestionDetailStore {
  question: QuestionDetail | null;
  answers: AnswerDetail[];
  answersLoaded: boolean;
  answersHasMore: boolean;
  lastAnswerId: number;
  source: DataSource | null;
  loadQuestion: (questionId: number) => Promise<QuestionDetail | null>;
  loadAnswers: (questionId: number, refresh?: boolean) => Promise<AnswerDetail[]>;
  loadMoreAnswers: (questionId: number) => Promise<AnswerDetail[]>;
  publishReply: (questionId: number, content: string) => Promise<void>;
  getAnswersWithPublishers: () => AnswerDetail[];
}

export const useQuestionDetailStore = create<QuestionDetailStore>()((set, get) => ({
  question: null,
  answers: [],
  answersLoaded: false,
  answersHasMore: true,
  lastAnswerId: 0,
  source: null,

  async loadQuestion(questionId) {
    const res = await getQuestionDetail(questionId);
    const question = res as QuestionDetail;
    set({ question, source: 'network' });
    if (question.questioner_id > 0) {
      await useCourseStore.getState().ensurePublishers([question.questioner_id]);
    }
    return question;
  },

  async loadAnswers(questionId, refresh = true) {
    const data = await getAnswersList(questionId, { cur_answer_id: 0, limit: 20 });
    const list = (data as AnswerDetail[]) || [];
    const publisherIds = list.map((a) => a.publisher_id).filter((id) => id > 0);
    await useCourseStore.getState().ensurePublishers(publisherIds);
    set({
      answers: list,
      lastAnswerId: list.length > 0 ? list[list.length - 1].id : 0,
      answersHasMore: list.length >= 20,
      answersLoaded: true,
      source: 'network',
    });
    return list;
  },

  async loadMoreAnswers(questionId) {
    const { lastAnswerId, answers } = get();
    const data = await getAnswersList(questionId, {
      cur_answer_id: lastAnswerId,
      limit: 10,
    });
    const list = (data as AnswerDetail[]) || [];
    const publisherIds = list.map((a) => a.publisher_id).filter((id) => id > 0);
    await useCourseStore.getState().ensurePublishers(publisherIds);
    const merged = [...answers, ...list];
    set({
      answers: merged,
      answersHasMore: list.length >= 10,
      lastAnswerId: list.length > 0 ? list[list.length - 1].id : lastAnswerId,
      source: 'network',
    });
    return merged;
  },

  async publishReply(questionId, content) {
    await publishAnswer({ content, question_id: questionId });
  },

  getAnswersWithPublishers() {
    const { answers } = get();
    const publishers = useCourseStore.getState().publishers;
    return answers.map((a) => ({
      ...a,
      publisher: a.publisher || publishers[a.publisher_id] || undefined,
    }));
  },
}));
