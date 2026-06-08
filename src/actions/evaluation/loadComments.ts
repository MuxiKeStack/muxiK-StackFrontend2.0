import { attachProfilesToComments } from '@/actions/publisher';
import {
  fetchCommentRepliesRaw,
  fetchTopLevelCommentsRaw,
} from '@/store/evaluation/detail/loaders';
import { useEvaluateDetailStore } from '@/store/evaluation/detail';

export async function loadEvaluationComments(
  bizId: number,
  isRefresh: boolean,
  lastId = 0
) {
  const { raw, hasMore } = await fetchTopLevelCommentsRaw(bizId, lastId);
  const filled = await attachProfilesToComments(raw);
  return useEvaluateDetailStore
    .getState()
    .ingestTopLevelComments(bizId, isRefresh, filled, hasMore);
}

export async function loadEvaluationReplies(
  bizId: number,
  rootId: number,
  lastId: number,
  limit: number
) {
  const raw = await fetchCommentRepliesRaw(rootId, lastId, limit);
  if (!raw.length) return;
  const filled = await attachProfilesToComments(raw);
  useEvaluateDetailStore.getState().ingestMergedReplies(bizId, rootId, filled);
}
