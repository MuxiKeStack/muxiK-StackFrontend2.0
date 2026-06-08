import type { CommentInfo } from '@/common/types/commentTypes';

import type { EvaluationDetailBucket } from '../shared/types';
import { getEvaluationBucket } from '../shared/types';

export interface EvaluateDetailState {
  activeBizId: number | null;
  buckets: Record<number, EvaluationDetailBucket>;
}

export function selectActiveEvaluation(state: EvaluateDetailState): CommentInfo | null {
  const bizId = state.activeBizId;
  if (bizId == null) return null;
  return getEvaluationBucket(state.buckets, bizId).evaluation;
}

export function selectEvaluationBucket(
  state: EvaluateDetailState,
  bizId: number | null
): EvaluationDetailBucket | null {
  if (bizId == null) return null;
  return getEvaluationBucket(state.buckets, bizId);
}
