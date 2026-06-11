import type { CommentType, User } from '@/common/types/commentTypes';
import { displayNickname } from '@/common/utils';

/** 合并顶层评论：刷新时整列替换（保留已展开的楼中楼），翻页时追加去重 */
export function mergeComments(
  existing: CommentType[],
  incoming: CommentType[],
  isRefresh: boolean
): CommentType[] {
  const existingById = new Map(existing.map((c) => [c.id, c]));
  const preserveLoadedReplies = (list: CommentType[]) =>
    list.map((c) => {
      const prev = existingById.get(c.id);
      if (!prev?.replies?.length) return c;
      return {
        ...c,
        replies: prev.replies,
        reply_count: prev.reply_count ?? c.reply_count,
        has_replies: prev.has_replies ?? c.has_replies,
        // total_comment_count: prev.total_comment_count ?? c.total_comment_count, // 待后端提供整楼准确总数
        replies_has_more: prev.replies_has_more ?? c.replies_has_more,
      };
    });

  if (isRefresh) return preserveLoadedReplies(incoming);

  const existingIds = new Set(existing.map((c) => c.id));
  const nextPage = incoming.filter((c) => !existingIds.has(c.id));
  return [...existing, ...preserveLoadedReplies(nextPage)];
}

/** 合并某条根评论下的回复（去重 + 跳过仍在等待的临时回复） */
export function mergeReplies(
  existing: CommentType[],
  incoming: CommentType[]
): CommentType[] {
  if (!incoming.length) return existing;
  const ids = new Set(existing.map((r) => r.id));
  const pendingKeys = new Set(
    existing.filter((r) => r.id < 0).map((r) => `${r.parent_comment_id}:${r.content}`)
  );
  const next = incoming.filter((r) => {
    if (ids.has(r.id)) return false;
    if (pendingKeys.has(`${r.parent_comment_id}:${r.content}`)) return false;
    return true;
  });
  if (!next.length) return existing;
  return [...existing, ...next];
}

export function createTempId(): number {
  return -Date.now();
}

export function createPendingComment(params: {
  tempId: number;
  bizId: number;
  content: string;
  rootId: number;
  parentId: number;
  replyToUid: number;
  replyToUser?: User;
  user: User;
}): CommentType {
  const { tempId, bizId, content, rootId, parentId, replyToUid, replyToUser, user } =
    params;
  return {
    id: tempId,
    commentator_id: 0,
    biz: 'Evaluation',
    biz_id: bizId,
    content,
    root_comment_id: rootId,
    parent_comment_id: parentId,
    reply_to_uid: replyToUid,
    ...(replyToUid > 0 && replyToUser
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

/** 临时评论写入列表：顶层前插，楼中楼尾部追加（与 ReplySection 展示反转一致） */
export function applyPendingComment(
  comments: CommentType[],
  reply: CommentType,
  rootId: number
): CommentType[] {
  if (rootId === 0) {
    return [reply, ...comments];
  }
  return comments.map((c) =>
    c.id === rootId
      ? {
          ...c,
          reply_count: (c.reply_count || 0) + 1,
          has_replies: true,
          replies: c.replies ? [...c.replies, reply] : [reply],
          // total_comment_count: (c.total_comment_count || 0) + 1, // 待后端提供整楼准确总数
        }
      : c
  );
}

export function removePendingComment(
  comments: CommentType[],
  tempId: number,
  rootId: number
): CommentType[] {
  if (rootId === 0) {
    return comments.filter((c) => c.id !== tempId);
  }
  return comments.map((c) => {
    if (c.id !== rootId) return c;
    const replies = c.replies?.filter((r) => r.id !== tempId);
    return {
      ...c,
      replies,
      reply_count: Math.max((c.reply_count || 1) - 1, 0),
      // total_comment_count: Math.max((c.total_comment_count || 1) - 1, 0), // 待后端提供整楼准确总数
    };
  });
}
