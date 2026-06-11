import type { AnswerDetail, QuestionDetail } from './types';

/** 单个问题详情的会话数据（按 questionId 隔离存放在 store.byId 里） */
export interface QuestionDetailEntry {
  question: QuestionDetail | null;
  answers: AnswerDetail[];
  answersLoaded: boolean;
  answersHasMore: boolean;
  lastAnswerId: number;
}

export function emptyQuestionEntry(): QuestionDetailEntry {
  return {
    question: null,
    answers: [],
    answersLoaded: false,
    answersHasMore: true,
    lastAnswerId: 0,
  };
}

export function getQuestionEntry(
  byId: Record<number, QuestionDetailEntry>,
  questionId: number
): QuestionDetailEntry {
  return byId[questionId] ?? emptyQuestionEntry();
}

export function patchQuestionEntry(
  byId: Record<number, QuestionDetailEntry>,
  questionId: number,
  patch: Partial<QuestionDetailEntry>
): Record<number, QuestionDetailEntry> {
  const prev = getQuestionEntry(byId, questionId);
  return { ...byId, [questionId]: { ...prev, ...patch } };
}

/** 构造一条「已发送、等待服务端确认」的临时回答，用于即时上屏 */
export function createPendingAnswer(params: {
  tempId: number;
  questionId: number;
  content: string;
  publisher: NonNullable<AnswerDetail['publisher']>;
}): AnswerDetail {
  const { tempId, questionId, content, publisher } = params;
  return {
    id: tempId,
    publisher_id: 0,
    question_id: questionId,
    content,
    stance: 0,
    total_support_count: 0,
    total_comment_count: 0,
    utime: Date.now(),
    ctime: Date.now(),
    publisher,
  };
}

/** 临时回答确认后，把它计入问题的回答数与预览列表 */
export function applyAnswerToQuestion(
  question: QuestionDetail,
  answers: AnswerDetail[],
  tempId: number
): QuestionDetail {
  const answer = answers.find((a) => a.id === tempId);
  return {
    ...question,
    answer_cnt: (question.answer_cnt || 0) + 1,
    preview_answers: [
      { id: tempId, content: answer?.content || '' },
      ...(question.preview_answers || []),
    ],
  };
}
