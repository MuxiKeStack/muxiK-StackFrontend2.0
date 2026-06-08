import type { AnswerDetail, QuestionDetail } from './types';

export function buildOptimisticAnswer(params: {
  optimisticId: number;
  questionId: number;
  content: string;
  publisher: NonNullable<AnswerDetail['publisher']>;
}): AnswerDetail {
  const { optimisticId, questionId, content, publisher } = params;
  return {
    id: optimisticId,
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

export function confirmOptimisticQuestion(
  question: QuestionDetail,
  answers: AnswerDetail[],
  optimisticId: number
): QuestionDetail | null {
  const answer = answers.find((a) => a.id === optimisticId);
  return {
    ...question,
    answer_cnt: (question.answer_cnt || 0) + 1,
    preview_answers: [
      { id: optimisticId, content: answer?.content || '' },
      ...(question.preview_answers || []),
    ],
  };
}
