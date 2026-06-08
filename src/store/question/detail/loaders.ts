import { getAnswersList, publishAnswer } from '@/common/request/api/answers';
import { getQuestionDetail } from '@/common/request/api/questions';

import type { AnswerDetail, QuestionDetail } from './types';

export async function fetchQuestion(questionId: number): Promise<QuestionDetail> {
  const res = await getQuestionDetail(questionId);
  return res as QuestionDetail;
}

export async function fetchAnswers(
  questionId: number,
  curAnswerId: number,
  limit: number
): Promise<AnswerDetail[]> {
  const data = await getAnswersList(questionId, { cur_answer_id: curAnswerId, limit });
  return (data as AnswerDetail[]) || [];
}

export async function submitAnswer(
  questionId: number,
  content: string
): Promise<void> {
  await publishAnswer({ content, question_id: questionId });
}
