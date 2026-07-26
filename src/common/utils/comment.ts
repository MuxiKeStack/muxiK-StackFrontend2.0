import type { CommentInfo } from '@/common/types/commentTypes';

// 昵称兜底：空白昵称显示为匿名用户
export function displayNickname(nickname?: string): string {
  const trimmed = nickname?.trim();
  return trimmed || '匿名用户';
}

// 切换单条评论/课评的点赞态与点赞数
export function toggleCommentLike(item: CommentInfo, willLike: boolean): CommentInfo {
  return {
    ...item,
    stance: willLike ? 1 : 0,
    total_support_count: Math.max(
      0,
      (item.total_support_count || 0) + (willLike ? 1 : -1)
    ),
  };
}
