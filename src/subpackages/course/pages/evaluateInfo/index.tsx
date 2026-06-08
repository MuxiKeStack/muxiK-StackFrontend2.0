import { View } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { memo, useCallback, useEffect, useRef } from 'react';

import './index.scss';

import { loadEvaluationComments } from '@/actions/evaluation/loadComments';
import {
  publishEvaluationReply,
  subscribeEvaluationDetailSticky,
  syncEvaluationDetailSession,
} from '@/actions';
import { useEvaluateDetailStore } from '@/store';
import { selectActiveEvaluation } from '@/store/evaluation/detail/selectors';
import { useUserStore } from '@/store/user';

import { BottomInput, FeedCard, GateScreen, ReviewDiscussion } from '@/common/components';
import { useAuthGuard } from '@/common/hooks/useAuthGuard';
import { useEvaluateCommentThread } from '@/store/evaluation/detail';
import { useGateGuard } from '@/common/hooks/useGateGuard';
import type { DiscussionComment } from '@/common/types/commentTypes';
import { NavigationBar } from '@/modules/navigation';

interface EvaluateCommentListProps {
  bizId: number | null;
  onCommentLongPressRef: React.MutableRefObject<
    ((comment: DiscussionComment) => void) | null
  >;
  expandRootRef: React.MutableRefObject<(rootId: number) => void>;
}

const EvaluateCommentList = memo(function EvaluateCommentList({
  bizId,
  onCommentLongPressRef,
  expandRootRef,
}: EvaluateCommentListProps) {
  const {
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
  } = useEvaluateCommentThread(bizId);

  expandRootRef.current = expandRoot;

  const handleLongPress = useCallback(
    (comment: DiscussionComment) => {
      onCommentLongPressRef.current?.(comment);
    },
    [onCommentLongPressRef]
  );

  return (
    <ReviewDiscussion
      comments={comments}
      hasMore={hasMore}
      initialLoading={initialLoading}
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

  const evaluation = useEvaluateDetailStore(selectActiveEvaluation);
  const activeBizId = useEvaluateDetailStore((s) => s.activeBizId);

  const bottomInputRef =
    useRef<import('@/common/components/BottomInput').BottomInputRef>(null);
  const replyToRef = useRef<DiscussionComment | null>(null);
  const onCommentLongPressRef = useRef<((comment: DiscussionComment) => void) | null>(
    null
  );
  const expandRootRef = useRef<(rootId: number) => void>(() => {});

  const handleReplySubmit = useCallback(
    async (value: string, replyTo: DiscussionComment | null) => {
      if (!value.trim() || !activeBizId) return;

      const profile = useUserStore.getState().profile;
      const result = await publishEvaluationReply({
        bizId: activeBizId,
        content: value,
        replyTo,
        user: {
          nickname: profile?.nickname || '我',
          avatar: profile?.avatar || '',
        },
      });

      if (result.ok) {
        if (result.expandRootId) expandRootRef.current(result.expandRootId);
        return;
      }

      if (result.code === 409002) {
        void Taro.showToast({ title: '不能回答未上过的课', icon: 'none' });
        return;
      }
      void Taro.showToast({ title: '评论失败', icon: 'error' });
    },
    [activeBizId]
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

  useEffect(() => {
    void syncEvaluationDetailSession(urlBizId > 0 ? urlBizId : undefined);
    return subscribeEvaluationDetailSticky();
  }, [urlBizId]);

  useEffect(() => {
    if (activeBizId !== null) void loadEvaluationComments(activeBizId, true);
  }, [activeBizId]);

  useDidShow(() => {
    const params = Taro.getCurrentInstance()?.router?.params || {};
    const urlId = Number(params.bizId);
    void syncEvaluationDetailSession(urlId > 0 ? urlId : undefined);
  });

  if (gate === 'loading') return null;
  if (gate === 'block') return <GateScreen />;

  return (
    <View className="evaluateInfo_page_container">
      <NavigationBar isBackToPage title="评课详细" />
      <View className="evaluateInfo_page_comment_wrapper">
        <FeedCard
          comment={evaluation}
          showAll
          type="inner"
          onCommentClick={() => handleLongPress(null)}
        />
      </View>

      <View className="evaluateInfo_page_comments_title">评论区</View>
      <View className="evaluateInfo_page_divider" />

      <View className="evaluateInfo_page_comments_list">
        <EvaluateCommentList
          key={activeBizId ?? 'none'}
          bizId={activeBizId}
          onCommentLongPressRef={onCommentLongPressRef}
          expandRootRef={expandRootRef}
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
