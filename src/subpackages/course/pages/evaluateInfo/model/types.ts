import type { CommentType } from '@/common/types/commentTypes';

/** 单条课评详情的评论区会话（按 bizId 隔离）。课评本体在 store/evaluations。 */
export interface EvaluationDetailEntry {
  comments: CommentType[];
  commentsLoaded: boolean;
  hasMore: boolean;
}
