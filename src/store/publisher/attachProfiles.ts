import type { CommentType, User } from '@/common/types/commentTypes';
import { displayNickname } from '@/common/utils';

function userFromUid(publishers: Record<number, User>, uid: number): User | undefined {
  if (!uid) return undefined;
  const cached = publishers[uid];
  return {
    id: uid,
    nickname: displayNickname(cached?.nickname),
    avatar: cached?.avatar ?? '',
    using_title: cached?.using_title,
    level: cached?.level,
  };
}

export function collectCommentPublisherIds(comments: CommentType[]): number[] {
  const commentatorIds = comments
    .filter((c) => !c.user?.nickname?.trim() && c.commentator_id > 0)
    .map((c) => c.commentator_id);
  const replyToUids = comments
    .filter((c) => !c.reply_to_user?.nickname?.trim() && c.reply_to_uid > 0)
    .map((c) => c.reply_to_uid);
  return [...new Set([...commentatorIds, ...replyToUids])];
}

export function attachUserProfiles(
  comments: CommentType[],
  publishers: Record<number, User>
): CommentType[] {
  return comments.map((c) => {
    let next = c;
    if (!c.user?.nickname?.trim() && c.commentator_id > 0) {
      const user = userFromUid(publishers, c.commentator_id);
      if (user) next = { ...next, user };
    } else if (c.user?.nickname != null && !c.user.nickname.trim()) {
      next = { ...next, user: { ...c.user, nickname: '匿名用户' } };
    }
    if (!c.reply_to_user?.nickname?.trim() && c.reply_to_uid > 0) {
      const replyToUser = userFromUid(publishers, c.reply_to_uid);
      if (replyToUser) next = { ...next, reply_to_user: replyToUser };
    } else if (
      c.reply_to_user?.nickname != null &&
      !c.reply_to_user.nickname.trim()
    ) {
      next = {
        ...next,
        reply_to_user: { ...c.reply_to_user, nickname: '匿名用户' },
      };
    }
    return next;
  });
}
