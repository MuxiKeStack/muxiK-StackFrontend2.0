import { View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useCallback, useEffect, useRef, useState } from 'react';

import './index.scss';

import { useEvaluateDetailStore } from '@/store';
import { useCourseStore } from '@/store/useCourseStore';
import { useUserStore } from '@/store/useUserStore';

import { BottomInput, FeedCard, GateScreen, ReviewDiscussion } from '@/common/components';
import { useAuthGuard } from '@/common/hooks/useAuthGuard';
import { useGateGuard } from '@/common/hooks/useGateGuard';
import { BusinessError } from '@/common/request/errors/BusinessError';
import type { DiscussionComment } from '@/common/types/commentTypes';
import { bus } from '@/common/utils';
import { NavigationBar } from '@/modules/navigation';

const Page: React.FC = () => {
  const gate = useGateGuard();
  const { guard } = useAuthGuard();
  const urlParams = Taro.getCurrentInstance()?.router?.params || {};
  const urlBizId = Number(urlParams.bizId);

  const evaluation = useEvaluateDetailStore((s) => s.evaluation);
  const comments = useEvaluateDetailStore((s) => s.comments);
  const commentsLoaded = useEvaluateDetailStore((s) => s.commentsLoaded);
  const hasMore = useEvaluateDetailStore((s) => s.hasMore);
  const loadEvaluation = useEvaluateDetailStore((s) => s.loadEvaluation);
  const loadComments = useEvaluateDetailStore((s) => s.loadComments);
  const loadReplies = useEvaluateDetailStore((s) => s.loadReplies);
  const publishReply = useEvaluateDetailStore((s) => s.publishReply);

  const [courseReview, setFeedCard] = useState<typeof evaluation>(() =>
    urlBizId > 0 ? null : bus.getSticky('evaluation') || null
  );
  const [bizId, setBizId] = useState<number | null>(null);
  const [newReplyRootId, setNewReplyRootId] = useState(0);

  const handleLoadReplies = useCallback(
    async (rootId: number, lastId: number, limit: number) => {
      try {
        return await loadReplies(rootId, lastId, limit);
      } catch (e) {
        console.error(e);
        return [];
      }
    },
    [loadReplies]
  );

  const handleReplySubmit = useCallback(
    async (value: string, replyTo: DiscussionComment | null) => {
      if (!value.trim() || !bizId) return;

      const rootId =
        replyTo?.root_comment_id === 0
          ? (replyTo?.id ?? 0)
          : (replyTo?.root_comment_id ?? 0);
      const parentId = replyTo?.id ?? 0;
      const profile = useUserStore.getState().profile;

      const selfUser = {
        id: 0,
        nickname: profile?.nickname || '我',
        avatar: profile?.avatar || '',
      };

      const store = useEvaluateDetailStore.getState();
      if (rootId !== 0) setNewReplyRootId(rootId);
      const optimisticId = store.addOptimisticReply({
        bizId,
        content: value,
        rootId,
        parentId,
        replyToUid: replyTo?.commentator_id ?? 0,
        user: selfUser,
      });

      try {
        const serverComment = await publishReply({ bizId, content: value, parentId, rootId });
        // 自己刚发的评论 publishers 里可能没有，用本地 profile 兜底头像昵称
        store.replaceOptimisticReply(optimisticId, rootId, {
          ...serverComment,
          user: serverComment.user || selfUser,
        });

        const updated = useCourseStore.getState().incrementEvaluationCommentCount(bizId);
        if (updated) {
          setFeedCard(updated);
          bus.stickyEmit('evaluation', updated);
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
    [bizId, publishReply]
  );

  const bottomInputRef =
    useRef<import('@/common/components/BottomInput').BottomInputRef>(null);
  const replyToRef = useRef<DiscussionComment | null>(null);

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

  const handleLikeClick = useCallback((props: { total_support_count?: number }) => {
    setFeedCard((prev) =>
      prev
        ? {
            ...prev,
            total_support_count:
              props.total_support_count ?? (prev.total_support_count || 0),
          }
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
        <ReviewDiscussion
          comments={comments}
          hasMore={hasMore}
          initialLoading={!commentsLoaded}
          onLoadMore={() => {
            if (!bizId) return;
            const lastId = comments[comments.length - 1]?.id ?? 0;
            void loadComments(bizId, false, lastId);
          }}
          onLoadMoreReplies={handleLoadReplies}
          onCommentLongPress={handleLongPress}
          supportsReplies={(item) => 'root_comment_id' in item}
          getReplyIndicator={(reply) => ({
            show: reply.root_comment_id !== reply.parent_comment_id,
            nickname: reply.reply_to_user?.nickname,
          })}
          newReplyRootId={newReplyRootId}
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
