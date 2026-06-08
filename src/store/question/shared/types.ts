import type { AnswerDetail, QuestionDetail } from '../detail/types';

/** 单个问题详情的服务端缓存桶（按 questionId 隔离） */
export interface QuestionDetailBucket {
  question: QuestionDetail | null;
  answers: AnswerDetail[];
  answersLoaded: boolean;
  answersHasMore: boolean;
  lastAnswerId: number;
}

export function createEmptyQuestionBucket(): QuestionDetailBucket {
  return {
    question: null,
    answers: [],
    answersLoaded: false,
    answersHasMore: true,
    lastAnswerId: 0,
  };
}

export function getQuestionBucket(
  buckets: Record<number, QuestionDetailBucket>,
  questionId: number
): QuestionDetailBucket {
  return buckets[questionId] ?? createEmptyQuestionBucket();
}

export function patchQuestionBucket(
  buckets: Record<number, QuestionDetailBucket>,
  questionId: number,
  patch: Partial<QuestionDetailBucket>
): Record<number, QuestionDetailBucket> {
  const prev = getQuestionBucket(buckets, questionId);
  return { ...buckets, [questionId]: { ...prev, ...patch } };
}
