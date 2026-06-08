import type { CommentInfo, CommentType } from '@/common/types/commentTypes';

/** 单条课评详情的服务端缓存桶（按 bizId 隔离） */
export interface EvaluationDetailBucket {
  evaluation: CommentInfo | null;
  comments: CommentType[];
  commentsLoaded: boolean;
  hasMore: boolean;
}

export function createEmptyEvaluationBucket(): EvaluationDetailBucket {
  return {
    evaluation: null,
    comments: [],
    commentsLoaded: false,
    hasMore: false,
  };
}

export function getEvaluationBucket(
  buckets: Record<number, EvaluationDetailBucket>,
  bizId: number
): EvaluationDetailBucket {
  return buckets[bizId] ?? createEmptyEvaluationBucket();
}

export function patchEvaluationBucket(
  buckets: Record<number, EvaluationDetailBucket>,
  bizId: number,
  patch: Partial<EvaluationDetailBucket>
): Record<number, EvaluationDetailBucket> {
  const prev = getEvaluationBucket(buckets, bizId);
  return { ...buckets, [bizId]: { ...prev, ...patch } };
}
