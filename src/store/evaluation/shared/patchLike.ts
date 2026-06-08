import type { CommentInfo } from '@/common/types/commentTypes';

/** 单条课评点赞态 patch，供各列表 / 详情桶复用 */
export function patchCommentInfoLike(item: CommentInfo, willLike: boolean): CommentInfo {
  const stance = willLike ? 1 : 0;
  const delta = willLike ? 1 : -1;
  return {
    ...item,
    stance,
    total_support_count: Math.max(0, (item.total_support_count || 0) + delta),
  };
}
