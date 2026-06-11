import { publishQuestion } from '@/common/request/api/questions';
import { bus } from '@/common/utils';

import type { QuestionDetail } from '@/subpackages/course/pages/questionInfo/model/types';

export type PublishQuestionBody = Parameters<typeof publishQuestion>[0];

export type PublishedQuestionMeta = {
  content: string;
  biz_id: number;
  biz: string;
  is_anonymous: boolean;
};

/** 发问 API → bus 同步班级问答列表 */
export async function publishQuestionAndBroadcast(
  body: PublishQuestionBody,
  meta: PublishedQuestionMeta
): Promise<QuestionDetail> {
  const res = await publishQuestion(body);
  const newQuestion = {
    ...(res || {}),
    content: meta.content,
    biz_id: meta.biz_id,
    biz: meta.biz,
    answer_cnt: 0,
    preview_answers: [],
    is_anonymous: meta.is_anonymous,
  } as QuestionDetail;
  bus.emit('question', newQuestion);
  return newQuestion;
}
