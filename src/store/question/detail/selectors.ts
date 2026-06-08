import type { AnswerDetail, QuestionDetail } from './types';
import { getQuestionBucket, type QuestionDetailBucket } from '../shared/types';

export interface QuestionDetailState {
  activeQuestionId: number | null;
  buckets: Record<number, QuestionDetailBucket>;
}

export function selectActiveQuestion(state: QuestionDetailState): QuestionDetail | null {
  const id = state.activeQuestionId;
  if (id == null) return null;
  return getQuestionBucket(state.buckets, id).question;
}

export function selectActiveAnswers(state: QuestionDetailState): AnswerDetail[] {
  const id = state.activeQuestionId;
  if (id == null) return [];
  return getQuestionBucket(state.buckets, id).answers;
}

export function selectQuestionBucket(
  state: QuestionDetailState,
  questionId: number | null
): QuestionDetailBucket | null {
  if (questionId == null) return null;
  return getQuestionBucket(state.buckets, questionId);
}
