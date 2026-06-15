import { View } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { memo, useCallback, useRef, useState } from 'react';

import './index.scss';

import { BottomInput, FeedCard, GateScreen, ReviewDiscussion } from '@/common/components';
import { useAuthGuard } from '@/common/hooks/useAuthGuard';
import { useGateGuard } from '@/common/hooks/useGateGuard';
import type { DiscussionComment } from '@/common/types/commentTypes';
import { NavigationBar } from '@/modules/navigation';
import { useEvaluationStore } from '@/store/evaluations';
import { useUserStore } from '@/store/user';

import {
  loadEvaluationComments,
  prepareEvaluationDetail,
  publishEvaluationReply,
  useEvaluateCommentThread,
} from './model';
import {
  bumpEvaluationDetailSession,
  getEvaluationDetailSessionGen,
} from './model/sessionGen';

/** 页面复用时从页栈顶层读参，比 getCurrentInstance().router.params 更可靠 */
function readUrlBizId(): number {
  const pages = Taro.getCurrentPages();
  const current = pages[pages.length - 1] as
    | { options?: Record<string, string> }
    | undefined;
  return Number(current?.options?.bizId);
}

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
  const [urlBizId, setUrlBizId] = useState(0);
  const lastBizIdRef = useRef(0);

  const evaluation = useEvaluationStore((s) =>
    urlBizId > 0 ? (s.byId[urlBizId] ?? null) : null
  );

  const bottomInputRef =
    useRef<import('@/common/components/BottomInput').BottomInputRef>(null);
  const replyToRef = useRef<DiscussionComment | null>(null);
  const onCommentLongPressRef = useRef<((comment: DiscussionComment) => void) | null>(
    null
  );
  const expandRootRef = useRef<(rootId: number) => void>(() => {});

  const handleReplySubmit = useCallback(
    async (value: string, replyTo: DiscussionComment | null) => {
      if (!value.trim() || !urlBizId) return;

      const profile = useUserStore.getState().profile;
      const result = await publishEvaluationReply({
        bizId: urlBizId,
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
    [urlBizId]
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

  const runDetailSession = useCallback(() => {
    const bizId = readUrlBizId();
    if (!(bizId > 0)) return;

    let gen = getEvaluationDetailSessionGen();
    if (bizId !== lastBizIdRef.current) {
      lastBizIdRef.current = bizId;
      setUrlBizId(bizId);
      gen = bumpEvaluationDetailSession();
    }

    void (async () => {
      await prepareEvaluationDetail(bizId);
      if (gen !== getEvaluationDetailSessionGen()) return;
      await loadEvaluationComments(bizId, true, 0, gen);
    })();
  }, []);

  useDidShow(runDetailSession);

  if (gate === 'loading') return null;
  if (gate === 'block') return <GateScreen title="评课详细" />;

  return (
    <View className="evaluateInfo_page_container">
      <NavigationBar isBackToPage title="评课详细" />
      <View className="evaluateInfo_page_comment_wrapper">
        {evaluation ? (
          <FeedCard
            comment={evaluation}
            showAll
            type="inner"
            onCommentClick={() => handleLongPress(null)}
          />
        ) : null}
      </View>

      <View className="evaluateInfo_page_comments_title">评论区</View>
      <View className="evaluateInfo_page_divider" />

      <View className="evaluateInfo_page_comments_list">
        <EvaluateCommentList
          key={urlBizId || 'none'}
          bizId={urlBizId || null}
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
