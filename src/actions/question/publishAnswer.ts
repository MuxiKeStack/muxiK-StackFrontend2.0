import { bus } from '@/common/utils';
import { useQuestionDetailStore } from '@/store/question/detail';

/** 编排：乐观回答 → API → 确认 / 回滚 */
export async function publishQuestionAnswer(params: {
  questionId: number;
  content: string;
  publisher: {
    id: number;
    avatar: string;
    nickname: string;
  };
}): Promise<{ ok: boolean }> {
  const { questionId, content, publisher } = params;
  const store = useQuestionDetailStore.getState();
  const optimisticId = store.addOptimisticAnswer({ questionId, content, publisher });

  try {
    await store.publishReply(questionId, content);
    const updated = store.confirmOptimisticAnswer(optimisticId, questionId);
    if (updated) bus.emit('question', updated);
    return { ok: true };
  } catch {
    store.removeOptimisticAnswer(optimisticId, questionId);
    return { ok: false };
  }
}
