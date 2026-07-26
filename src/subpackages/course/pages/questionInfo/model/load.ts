import { ensurePublisherIds } from '@/store/publisher/enrich';

import { useQuestionDetailStore } from './store';

/** URL 驱动：按 questionId 激活详情会话 */
export async function syncQuestionSession(questionId: number): Promise<void> {
  if (!(questionId > 0)) return;
  const active = useQuestionDetailStore.getState().activeQuestionId;
  if (active === questionId) return;
  await loadQuestionDetail(questionId);
  await loadQuestionAnswers(questionId);
}

export async function loadQuestionDetail(questionId: number) {
  const question = await useQuestionDetailStore.getState().loadQuestion(questionId);
  if (question?.questioner_id) {
    await ensurePublisherIds([question.questioner_id]);
  }
  return question;
}

export async function loadQuestionAnswers(questionId: number) {
  const list = await useQuestionDetailStore.getState().loadAnswers(questionId);
  await ensurePublisherIds(list.map((a) => a.publisher_id));
  return list;
}

export async function loadMoreQuestionAnswers(questionId: number) {
  const list = await useQuestionDetailStore.getState().loadMoreAnswers(questionId);
  await ensurePublisherIds(list.map((a) => a.publisher_id));
  return list;
}
