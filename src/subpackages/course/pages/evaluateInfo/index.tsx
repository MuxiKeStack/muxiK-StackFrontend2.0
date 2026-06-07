import { View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { memo, useCallback, useEffect, useRef, useState } from 'react';

import './index.scss';

import { useEvaluateDetailStore } from '@/store';
import { useCourseStore } from '@/store/useCourseStore';
import { useUserStore } from '@/store/useUserStore';

import { BottomInput, FeedCard, GateScreen, ReviewDiscussion } from '@/common/components';
import { useAuthGuard } from '@/common/hooks/useAuthGuard';
import { useGateGuard } from '@/common/hooks/useGateGuard';
import { BusinessError } from '@/common/request/errors/BusinessError';
import type { CommentInfo, DiscussionComment } from '@/common/types/commentTypes';
import { bus } from '@/common/utils';
import { NavigationBar } from '@/modules/navigation';

/** 与 FeedCard 状态隔离，避免发布成功后更新评论数时带动整表重渲 */
const EvaluateCommentList = memo(function EvaluateCommentList({
  bizId,
  onCommentLongPressRef,
}: {
  bizId: number | null;
  onCommentLongPressRef: React.MutableRefObject<
    ((comment: DiscussionComment) => void) | null
  >;
}) {
  const comments = useEvaluateDetailStore((s) => s.comments);
  const commentsLoaded = useEvaluateDetailStore((s) => s.commentsLoaded);
  const hasMore = useEvaluateDetailStore((s) => s.hasMore);
  const loadComments = useEvaluateDetailStore((s) => s.loadComments);
  const fetchAndMergeReplies = useEvaluateDetailStore((s) => s.fetchAndMergeReplies);
  const expandedReplyRootIds = useEvaluateDetailStore((s) => s.expandedReplyRootIds);
  const setReplyExpanded = useEvaluateDetailStore((s) => s.setReplyExpanded);
  const handleReplyExpandedChange = useCallback(
    (rootId: number, expanded: boolean) => {
      setReplyExpanded(rootId, expanded);
    },
    [setReplyExpanded]
  );

  const handleLoadReplies = useCallback(
    async (rootId: number, lastId: number, limit: number) => {
      try {
        await fetchAndMergeReplies(rootId, lastId, limit);
      } catch (e) {
        console.error(e);
      }
    },
    [fetchAndMergeReplies]
  );

  const handleLongPress = useCallback(
    (comment: DiscussionComment) => {
      onCommentLongPressRef.current?.(comment);
    },
    [onCommentLongPressRef]
  );

  const supportsReplies = useCallback(
    (item: DiscussionComment) => 'root_comment_id' in item,
    []
  );

  const getReplyIndicator = useCallback(
    (reply: DiscussionComment) => ({
      show: reply.root_comment_id !== reply.parent_comment_id,
      nickname: reply.reply_to_user?.nickname,
    }),
    []
  );

  const handleLoadMoreComments = useCallback(() => {
    if (!bizId) return;
    const list = useEvaluateDetailStore.getState().comments;
    const lastId = list[list.length - 1]?.id ?? 0;
    void loadComments(bizId, false, lastId);
  }, [bizId, loadComments]);

  return (
    <ReviewDiscussion
      comments={comments}
      hasMore={hasMore}
      initialLoading={!commentsLoaded}
      onLoadMore={handleLoadMoreComments}
      onLoadMoreReplies={handleLoadReplies}
      onCommentLongPress={handleLongPress}
      supportsReplies={supportsReplies}
      getReplyIndicator={getReplyIndicator}
      expandedReplyRootIds={expandedReplyRootIds}
      onReplyExpandedChange={handleReplyExpandedChange}
    />
  );
});

const Page: React.FC = () => {
  const gate = useGateGuard();
  const { guard } = useAuthGuard();
  const urlParams = Taro.getCurrentInstance()?.router?.params || {};
  const urlBizId = Number(urlParams.bizId);

  const evaluation = useEvaluateDetailStore((s) => s.evaluation);
  const loadEvaluation = useEvaluateDetailStore((s) => s.loadEvaluation);
  const loadComments = useEvaluateDetailStore((s) => s.loadComments);
  const publishReply = useEvaluateDetailStore((s) => s.publishReply);

  const [courseReview, setFeedCard] = useState<typeof evaluation>(() =>
    urlBizId > 0 ? null : bus.getSticky('evaluation') || null
  );
  const [bizId, setBizId] = useState<number | null>(null);

  const handleReplySubmit = useCallback(
    async (value: string, replyTo: DiscussionComment | null) => {
      if (!value.trim() || !bizId) return;

      const rootId =
        !replyTo || replyTo.root_comment_id == null || replyTo.root_comment_id === 0
          ? (replyTo?.id ?? 0)
          : replyTo.root_comment_id;
      const parentId = replyTo?.id ?? 0;
      const profile = useUserStore.getState().profile;

      const store = useEvaluateDetailStore.getState();
      const optimisticId = store.addOptimisticReply({
        bizId,
        content: value,
        rootId,
        parentId,
        replyToUid: replyTo?.commentator_id ?? 0,
        user: {
          id: 0,
          nickname: profile?.nickname || '我',
          avatar: profile?.avatar || '',
        },
      });
      try {
        await publishReply({ bizId, content: value, parentId, rootId });

        const updated = useCourseStore.getState().incrementEvaluationCommentCount(bizId);
        if (updated) {
          bus.stickyEmit('evaluation', updated);
          // 直链进入时本页没有 onSticky 监听，只 patch 评论数，避免整卡替换触发二次闪烁
          if (urlBizId > 0) {
            setFeedCard((prev) =>
              prev?.id === bizId
                ? { ...prev, total_comment_count: updated.total_comment_count }
                : prev
            );
          }
        }
      } catch (error) {
        store.removeOptimisticReply(optimisticId, rootId);
        if (error instanceof BusinessError && error.code === 409002) {
          Taro.showToast({ title: '不能回答未上过的课', icon: 'none' });
          return;
        }
        Taro.showToast({ title: '评论失败', icon: 'error' });
      }
    },
    [bizId, publishReply, urlBizId]
  );

  const bottomInputRef =
    useRef<import('@/common/components/BottomInput').BottomInputRef>(null);
  const replyToRef = useRef<DiscussionComment | null>(null);
  const onCommentLongPressRef = useRef<((comment: DiscussionComment) => void) | null>(
    null
  );

  const handleLongPress = useCallback(
    (comment: DiscussionComment | null) => {
      if (!guard()) return;
      if (comment) {
        replyToRef.current = comment;
        bottomInputRef.current?.insertMention(comment.user?.nickname || '');
      }
    },
    [guard]
  );

  onCommentLongPressRef.current = (comment: DiscussionComment) => {
    handleLongPress(comment);
  };

  const clearReply = useCallback(() => {
    replyToRef.current = null;
  }, []);

  const handleMentionRemoved = useCallback(() => {
    replyToRef.current = null;
  }, []);

  const onReplySubmit = useCallback(
    (value: string) => {
      if (!guard()) return;
      void handleReplySubmit(value, replyToRef.current);
      clearReply();
      bottomInputRef.current?.clearValue();
    },
    [guard, handleReplySubmit, clearReply]
  );

  const handleLikeClick = useCallback((updated: CommentInfo) => {
    if (updated.total_support_count == null) return;
    setFeedCard((prev) =>
      prev
        ? { ...prev, total_support_count: updated.total_support_count }
        : prev
    );
  }, []);

  useEffect(() => {
    if (urlBizId > 0) {
      void loadEvaluation(urlBizId).then((data) => {
        if (data) {
          setFeedCard(data);
          setBizId(data.id);
        }
      });
    } else {
      const offEvaluation = bus.onSticky('evaluation', (e: { id?: number }) => {
        if (e) {
          setFeedCard(e);
          setBizId(e.id ?? null);
        }
      });
      return () => offEvaluation();
    }
  }, [urlBizId, loadEvaluation]);

  useEffect(() => {
    if (evaluation && !courseReview) {
      setFeedCard(evaluation);
      setBizId(evaluation.id);
    }
  }, [evaluation, courseReview]);

  useEffect(() => {
    if (bizId !== null) void loadComments(bizId, true);
  }, [bizId, loadComments]);

  if (gate === 'loading') return null;
  if (gate === 'block') return <GateScreen />;

  return (
    <View className="evaluateInfo_page_container">
      <NavigationBar isBackToPage title="评课详细" />
      <View className="evaluateInfo_page_comment_wrapper">
        <FeedCard
          comment={courseReview}
          showAll
          type="inner"
          onLikeClick={handleLikeClick}
          onCommentClick={() => handleLongPress(null)}
        />
      </View>

      <View className="evaluateInfo_page_comments_title">评论区</View>
      <View className="evaluateInfo_page_divider" />

      <View className="evaluateInfo_page_comments_list">
        <EvaluateCommentList
          bizId={bizId}
          onCommentLongPressRef={onCommentLongPressRef}
        />
      </View>

      <BottomInput
        ref={bottomInputRef}
        onSubmit={onReplySubmit}
        onMentionRemoved={handleMentionRemoved}
      />
    </View>
  );
};

export default Page;
