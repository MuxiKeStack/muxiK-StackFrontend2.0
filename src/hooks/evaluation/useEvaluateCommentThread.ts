import { useCallback, useState } from 'react';

import {
  loadEvaluationComments,
  loadEvaluationReplies,
} from '@/actions/evaluation/loadComments';
import type { DiscussionComment } from '@/common/types/commentTypes';
import { useEvaluateDetailStore } from '@/store/evaluation/detail';
import { selectEvaluationBucket } from '@/store/evaluation/detail/selectors';

/** 评课评论区 UI 编排：服务端数据来自 store 桶，展开态留在 hook 内 */
export function useEvaluateCommentThread(bizId: number | null) {
  const bucket = useEvaluateDetailStore((s) => selectEvaluationBucket(s, bizId));
  const [expandedReplyRootIds, setExpandedReplyRootIds] = useState<number[]>([]);

  const comments = bucket?.comments ?? [];
  const hasMore = bucket?.hasMore ?? false;
  const initialLoading = bizId != null && !(bucket?.commentsLoaded ?? false);

  const expandRoot = useCallback((rootId: number) => {
    setExpandedReplyRootIds((prev) => (prev.includes(rootId) ? prev : [...prev, rootId]));
  }, []);

  const handleReplyExpandedChange = useCallback((rootId: number, expanded: boolean) => {
    setExpandedReplyRootIds((prev) => {
      const has = prev.includes(rootId);
      if (expanded && !has) return [...prev, rootId];
      if (!expanded && has) return prev.filter((id) => id !== rootId);
      return prev;
    });
  }, []);

  const handleLoadReplies = useCallback(
    async (rootId: number, lastId: number, limit: number) => {
      if (!bizId) return;
      try {
        await loadEvaluationReplies(bizId, rootId, lastId, limit);
      } catch (e) {
        console.error(e);
      }
    },
    [bizId]
  );

  const getReplyIndicator = useCallback((reply: DiscussionComment) => {
    const show = reply.root_comment_id !== reply.parent_comment_id;
    if (!show) return { show: false };
    const nickname = reply.reply_to_user?.nickname?.trim();
    return { show: true, nickname: nickname || '匿名用户' };
  }, []);

  const handleLoadMoreComments = useCallback(() => {
    if (!bizId) return;
    const list = selectEvaluationBucket(useEvaluateDetailStore.getState(), bizId)?.comments ?? [];
    const lastId = list[list.length - 1]?.id ?? 0;
    void loadEvaluationComments(bizId, false, lastId);
  }, [bizId]);

  const supportsReplies = useCallback(
    (item: DiscussionComment) => 'root_comment_id' in item,
    []
  );

  return {
    comments,
    hasMore,
    initialLoading,
    expandedReplyRootIds,
    expandRoot,
    handleReplyExpandedChange,
    handleLoadReplies,
    handleLoadMoreComments,
    getReplyIndicator,
    supportsReplies,
  };
}
