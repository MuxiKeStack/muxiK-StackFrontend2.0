import { bus } from '@/common/utils';

import { useQuestionDetailStore } from './store';

/** 乐观回答 → API → bus 同步班级问答列表 */
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
  const tempId = store.addPendingAnswer({ questionId, content, publisher });

  try {
    await store.publishReply(questionId, content);
    const updated = store.confirmPendingAnswer(tempId, questionId);
    if (updated) bus.emit('question', updated);
    return { ok: true };
  } catch {
    store.removePendingAnswer(tempId, questionId);
    return { ok: false };
  }
}
