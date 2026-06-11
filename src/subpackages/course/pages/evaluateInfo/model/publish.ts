import { BusinessError } from '@/common/request/errors/BusinessError';
import type { CommentInfo, DiscussionComment, User } from '@/common/types/commentTypes';
import { useEvaluationStore } from '@/store/evaluations';

import { useEvaluateDetailStore } from './store';

export type PublishEvaluationReplyResult =
  | { ok: true; updated?: CommentInfo; expandRootId?: number }
  | { ok: false; code?: number };

/** 乐观回复 → API → 评论数写入实体仓；失败回滚 */
export async function publishEvaluationReply(params: {
  bizId: number;
  content: string;
  replyTo: DiscussionComment | null;
  user: Pick<User, 'nickname' | 'avatar'>;
}): Promise<PublishEvaluationReplyResult> {
  const { bizId, content, replyTo, user } = params;
  const rootId =
    !replyTo || replyTo.root_comment_id == null || replyTo.root_comment_id === 0
      ? (replyTo?.id ?? 0)
      : replyTo.root_comment_id;
  const parentId = replyTo?.id ?? 0;

  const store = useEvaluateDetailStore.getState();
  const { tempId, expandRootId } = store.addPendingReply({
    bizId,
    content,
    rootId,
    parentId,
    replyToUid: replyTo?.commentator_id ?? replyTo?.user?.id ?? 0,
    replyToUser: replyTo?.user,
    user: { id: 0, nickname: user.nickname, avatar: user.avatar },
  });

  try {
    await store.publishReply({ bizId, content, parentId, rootId });
    const updated = useEvaluationStore.getState().incrementCommentCount(bizId);
    return { ok: true, updated, expandRootId };
  } catch (error) {
    store.removePendingReply(bizId, tempId, rootId);
    if (error instanceof BusinessError && error.code === 409002) {
      return { ok: false, code: 409002 };
    }
    return { ok: false };
  }
}
