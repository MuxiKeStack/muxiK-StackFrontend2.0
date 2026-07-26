import type { AnswerDetail, QuestionDetail } from './types';
import { getQuestionEntry, type QuestionDetailEntry } from './utils';

export interface QuestionDetailState {
  activeQuestionId: number | null;
  byId: Record<number, QuestionDetailEntry>;
}

export function selectActiveQuestion(state: QuestionDetailState): QuestionDetail | null {
  const id = state.activeQuestionId;
  if (id == null) return null;
  return getQuestionEntry(state.byId, id).question;
}

export function selectActiveAnswers(state: QuestionDetailState): AnswerDetail[] {
  const id = state.activeQuestionId;
  if (id == null) return [];
  return getQuestionEntry(state.byId, id).answers;
}

export function selectQuestionEntry(
  state: QuestionDetailState,
  questionId: number | null
): QuestionDetailEntry | null {
  if (questionId == null) return null;
  return getQuestionEntry(state.byId, questionId);
}
