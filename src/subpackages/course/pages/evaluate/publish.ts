import { publishEvaluation } from '@/common/request/api/evaluations';
import type { CommentInfo } from '@/common/types/commentTypes';
import { bus } from '@/common/utils';
import { useEvaluationHistoryStore } from '@/store/evaluationHistory/store';
import { useMyClassStore } from '@/store/myClass/store';

export type PublishEvaluationBody = Parameters<typeof publishEvaluation>[0];

export async function publishEvaluationAndBroadcast(
  body: PublishEvaluationBody
): Promise<CommentInfo> {
  const data = await publishEvaluation(body);
  const newEvaluation = { ...body, ...(data || {}) } as CommentInfo;
  useEvaluationHistoryStore.getState().invalidateCache('Public');
  if (body.course_id) {
    useMyClassStore.getState().markCourseEvaluated(body.course_id);
  }
  bus.emit('evaluation', newEvaluation);
  return newEvaluation;
}
