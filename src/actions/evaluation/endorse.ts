import { endorseEvaluation as endorseEvaluationApi } from '@/common/request/api/evaluations';
import type { CommentInfo } from '@/common/types/commentTypes';
import { COMMENT_ACTIONS } from '@/common/types/courseType';

import { syncEvaluationLike } from './syncLike';

/** 编排：调 API 点赞/取消，再跨 store 同步 */
export async function endorseEvaluation(
  evaluationId: number,
  action: COMMENT_ACTIONS
): Promise<CommentInfo | undefined> {
  const willLike = action === COMMENT_ACTIONS.LIKE;
  await endorseEvaluationApi(evaluationId, { stance: willLike ? 1 : 0 });
  return syncEvaluationLike(evaluationId, willLike);
}
