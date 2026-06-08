import { ensurePublisherIds } from '@/actions/publisher';
import { useQuestionDetailStore } from '@/store/question/detail';

/** 拉取问题并补全 publisher */
export async function loadQuestionDetail(questionId: number) {
  const question = await useQuestionDetailStore.getState().loadQuestion(questionId);
  if (question?.questioner_id) {
    await ensurePublisherIds([question.questioner_id]);
  }
  return question;
}

/** 拉取回答并补全 publisher */
export async function loadQuestionAnswers(questionId: number) {
  const list = await useQuestionDetailStore.getState().loadAnswers(questionId);
  await ensurePublisherIds(list.map((a) => a.publisher_id));
  return list;
}

/** 加载更多回答并补全 publisher */
export async function loadMoreQuestionAnswers(questionId: number) {
  const list = await useQuestionDetailStore.getState().loadMoreAnswers(questionId);
  await ensurePublisherIds(list.map((a) => a.publisher_id));
  return list;
}
