import { useClassInfoStore } from '@/store/classInfo';

import type { CommentInfo } from '@/common/types/commentTypes';
import type { WebQuestionVo } from '@/common/types/userTypes';
import { bus } from '@/common/utils';

/** 班级页：订阅发评 / 发问后的列表同步 */
export function subscribeClassInfoEvents(courseId: number): () => void {
  const offQuestion = bus.on('question', (q: WebQuestionVo) => {
    if (q) useClassInfoStore.getState().upsertQuestion(courseId, q);
  });
  const offEvaluation = bus.on('evaluation', (e: CommentInfo) => {
    if (e) useClassInfoStore.getState().prependEvaluation(courseId, e);
  });
  return () => {
    offQuestion();
    offEvaluation();
  };
}
