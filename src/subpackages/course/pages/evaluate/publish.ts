import { publishEvaluation } from '@/common/request/api/evaluations';
import type { CommentInfo } from '@/common/types/commentTypes';
import { bus } from '@/common/utils';
import { useEvaluationHistoryStore } from '@/store/evaluationHistory/store';

export type PublishEvaluationBody = Parameters<typeof publishEvaluation>[0];

/** 发评 API → 失效历史缓存 → bus 同步班级列表 */
export async function publishEvaluationAndBroadcast(
  body: PublishEvaluationBody
): Promise<CommentInfo> {
  const data = await publishEvaluation(body);
  const newEvaluation = { ...body, ...(data || {}) } as CommentInfo;
  useEvaluationHistoryStore.getState().invalidateCache('Public');
  bus.emit('evaluation', newEvaluation);
  return newEvaluation;
}
