import { useCallback, useState } from 'react';

import type { DiscussionComment } from '@/common/types/commentTypes';

import { loadEvaluationComments, loadEvaluationReplies } from './load';
import { selectEvaluationEntry } from './selectors';
import { useEvaluateDetailStore } from './store';

/** 评课评论区 UI：服务端数据来自 model store，展开态留在 hook 内 */
export function useEvaluateCommentThread(bizId: number | null) {
  const entry = useEvaluateDetailStore((s) => selectEvaluationEntry(s, bizId));
  const [expandedReplyRootIds, setExpandedReplyRootIds] = useState<number[]>([]);

  const comments = entry?.comments ?? [];
  const hasMore = entry?.hasMore ?? false;
  const initialLoading = bizId != null && !(entry?.commentsLoaded ?? false);

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

  // 主评下楼中楼暂不展示 @xxx，待 reply_to 数据稳定后再启用
  const getReplyIndicator = useCallback((_reply: DiscussionComment) => {
    return { show: false };
    // const nickname = reply.reply_to_user?.nickname?.trim();
    // const hasTarget = (reply.reply_to_uid ?? 0) > 0 || Boolean(nickname);
    // if (!hasTarget) return { show: false };
    // return { show: true, nickname: nickname || '匿名用户' };
  }, []);

  const handleLoadMoreComments = useCallback(async () => {
    if (!bizId) return;
    const list =
      selectEvaluationEntry(useEvaluateDetailStore.getState(), bizId)?.comments ?? [];
    const lastId = list[list.length - 1]?.id ?? 0;
    await loadEvaluationComments(bizId, false, lastId);
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
