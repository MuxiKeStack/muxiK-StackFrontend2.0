import type { CommentType, User } from '@/common/types/commentTypes';

import { displayNickname } from '@/store/publisher';

export function createOptimisticId(): number {
  return -Date.now();
}

export function buildOptimisticComment(params: {
  optimisticId: number;
  bizId: number;
  content: string;
  rootId: number;
  parentId: number;
  replyToUid: number;
  replyToUser?: User;
  user: User;
}): CommentType {
  const {
    optimisticId,
    bizId,
    content,
    rootId,
    parentId,
    replyToUid,
    replyToUser,
    user,
  } = params;
  const nested = rootId !== parentId;
  return {
    id: optimisticId,
    commentator_id: 0,
    biz: 'Evaluation',
    biz_id: bizId,
    content,
    root_comment_id: rootId,
    parent_comment_id: parentId,
    reply_to_uid: replyToUid,
    ...(nested && replyToUser
      ? {
          reply_to_user: {
            ...replyToUser,
            nickname: displayNickname(replyToUser.nickname),
          },
        }
      : {}),
    ctime: Date.now(),
    utime: Date.now(),
    user,
  };
}

export function insertOptimisticComment(
  comments: CommentType[],
  comment: CommentType,
  rootId: number
): CommentType[] {
  if (rootId === 0) {
    return [comment, ...comments];
  }
  return comments.map((c) =>
    c.id === rootId
      ? {
          ...c,
          reply_count: (c.reply_count || 0) + 1,
          has_replies: true,
          replies: c.replies ? [comment, ...c.replies] : [comment],
          total_comment_count: (c.total_comment_count || 0) + 1,
        }
      : c
  );
}

export function removeOptimisticComment(
  comments: CommentType[],
  optimisticId: number,
  rootId: number
): CommentType[] {
  if (rootId === 0) {
    return comments.filter((c) => c.id !== optimisticId);
  }
  return comments.map((c) => {
    if (c.id !== rootId) return c;
    const replies = c.replies?.filter((r) => r.id !== optimisticId);
    return {
      ...c,
      replies,
      reply_count: Math.max((c.reply_count || 1) - 1, 0),
      total_comment_count: Math.max((c.total_comment_count || 1) - 1, 0),
    };
  });
}
