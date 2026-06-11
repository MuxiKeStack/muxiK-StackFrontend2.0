import { useEvaluationStore } from '@/store/evaluations';
import { attachProfilesToComments } from '@/store/publisher/enrich';

import { fetchCommentReplies, fetchTopLevelComments } from './api';
import { getEvaluationDetailSessionGen } from './sessionGen';
import { useEvaluateDetailStore } from './store';

/** URL 驱动：按 bizId 准备详情会话，实体缺失时拉取 */
export async function prepareEvaluationDetail(bizId: number): Promise<void> {
  if (!(bizId > 0)) return;
  const detail = useEvaluateDetailStore.getState();
  if (!useEvaluationStore.getState().get(bizId)) {
    await detail.loadEvaluation(bizId);
  }
  detail.activate(bizId);
}

export async function loadEvaluationComments(
  bizId: number,
  isRefresh: boolean,
  lastId = 0,
  expectedGen?: number
) {
  const gen = expectedGen ?? getEvaluationDetailSessionGen();
  const { raw, hasMore } = await fetchTopLevelComments(bizId, lastId);
  if (gen !== getEvaluationDetailSessionGen()) return [];
  const filled = await attachProfilesToComments(raw);
  if (gen !== getEvaluationDetailSessionGen()) return [];
  return useEvaluateDetailStore
    .getState()
    .setComments(bizId, isRefresh, filled, hasMore, gen);
}

export async function loadEvaluationReplies(
  bizId: number,
  rootId: number,
  lastId: number,
  limit: number
) {
  const raw = await fetchCommentReplies(rootId, lastId, limit);
  const filled = raw.length ? await attachProfilesToComments(raw) : [];
  useEvaluateDetailStore.getState().appendReplies(bizId, rootId, filled, limit);
}

/** @deprecated 使用 prepareEvaluationDetail */
export const syncEvaluationSession = prepareEvaluationDetail;
