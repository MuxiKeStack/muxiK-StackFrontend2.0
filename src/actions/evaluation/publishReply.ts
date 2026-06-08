import { BusinessError } from '@/common/request/errors/BusinessError';
import type { CommentInfo, DiscussionComment, User } from '@/common/types/commentTypes';
import { useEvaluateDetailStore } from '@/store/evaluation/detail';

import { syncEvaluationCommentCount } from './syncCommentCount';

export type PublishEvaluationReplyResult =
  | { ok: true; updated?: CommentInfo; expandRootId?: number }
  | { ok: false; code?: number };

/** 编排：乐观回复 → API → 同步评论数；失败回滚乐观条目 */
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
  const nested = rootId !== parentId;

  const store = useEvaluateDetailStore.getState();
  const { optimisticId, expandRootId } = store.addOptimisticReply({
    bizId,
    content,
    rootId,
    parentId,
    replyToUid: replyTo?.commentator_id ?? replyTo?.user?.id ?? 0,
    replyToUser: nested ? replyTo?.user : undefined,
    user: { id: 0, nickname: user.nickname, avatar: user.avatar },
  });

  try {
    await store.publishReply({ bizId, content, parentId, rootId });
    const updated = syncEvaluationCommentCount(bizId);
    return { ok: true, updated, expandRootId };
  } catch (error) {
    store.removeOptimisticReply(bizId, optimisticId, rootId);
    if (error instanceof BusinessError && error.code === 409002) {
      return { ok: false, code: 409002 };
    }
    return { ok: false };
  }
}
