import { useQuestionDetailStore } from '@/store/question/detail';

import {
  loadMoreQuestionAnswers,
  loadQuestionAnswers,
  loadQuestionDetail,
} from './loadDetail';

/** 按 questionId 打开详情会话（拉取问题 + 回答） */
export async function openQuestionDetail(questionId: number): Promise<number | null> {
  if (!(questionId > 0)) return null;
  const question = await loadQuestionDetail(questionId);
  if (!question) return null;
  await loadQuestionAnswers(questionId);
  return questionId;
}

/** 详情页：URL 变化时同步会话（兼容 Taro 页面复用） */
export async function syncQuestionDetailSession(questionId?: number): Promise<void> {
  if (!(questionId && questionId > 0)) return;
  const active = useQuestionDetailStore.getState().activeQuestionId;
  if (active !== questionId) {
    await openQuestionDetail(questionId);
  }
}

export { loadMoreQuestionAnswers };
