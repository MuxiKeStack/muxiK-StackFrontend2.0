import { View } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';

import './index.scss';

import {
  loadMoreQuestionAnswers,
  publishQuestionAnswer,
  syncQuestionDetailSession,
} from '@/actions';
import { usePublisherStore } from '@/store/publisher';
import { useQuestionDetailStore } from '@/store/question/detail';
import {
  selectActiveAnswers,
  selectActiveQuestion,
  selectQuestionBucket,
} from '@/store/question/detail/selectors';
import { useUserStore } from '@/store/user';

import { BottomInput, FeedCard, ReviewDiscussion } from '@/common/components';
import type { BottomInputRef } from '@/common/components/BottomInput';
import { useAuthGuard } from '@/common/hooks/useAuthGuard';
import { getAnswerDetail } from '@/common/request/api/answers';

const Page: React.FC = () => {
  const { guard } = useAuthGuard();
  const question = useQuestionDetailStore(selectActiveQuestion);
  const answers = useQuestionDetailStore(selectActiveAnswers);
  const activeQuestionId = useQuestionDetailStore((s) => s.activeQuestionId);
  const bucket = useQuestionDetailStore((s) => selectQuestionBucket(s, activeQuestionId));
  const answersHasMore = bucket?.answersHasMore ?? true;
  const answersLoaded = bucket?.answersLoaded ?? false;
  const publishers = usePublisherStore((s) => s.publishers);
  const bottomInputRef = useRef<BottomInputRef>(null);

  const syncFromRoute = useCallback(async () => {
    const params = Taro.getCurrentInstance()?.router?.params || {};
    let qid = Number(params.id);

    if (!(qid > 0) && params.answerId) {
      try {
        const answer = await getAnswerDetail(Number(params.answerId));
        qid = Number(answer.question_id);
      } catch (e) {
        console.error('根据回答加载问题失败:', e);
      }
    }

    if (qid > 0) await syncQuestionDetailSession(qid);
  }, []);

  useEffect(() => {
    void syncFromRoute();
  }, [syncFromRoute]);

  useDidShow(() => {
    void syncFromRoute();
  });

  const handleReplySubmit = useCallback(
    async (value: string) => {
      const questionId = question?.id;
      if (!value.trim() || !questionId || !guard()) return;

      const profile = useUserStore.getState().profile;
      const result = await publishQuestionAnswer({
        questionId,
        content: value,
        publisher: {
          id: 0,
          avatar: profile?.avatar || '',
          nickname: profile?.nickname || '我',
        },
      });

      if (result.ok) {
        bottomInputRef.current?.clearValue();
        return;
      }
      void Taro.showToast({ title: '发布失败', icon: 'error' });
    },
    [question?.id, guard]
  );

  const normalizedAnswers = useMemo(
    () =>
      answers.map((a) => ({
        ...a,
        publisher: a.publisher || publishers[a.publisher_id] || undefined,
      })),
    [answers, publishers]
  );

  const loadMoreAnswers = async () => {
    const questionId = question?.id;
    if (!questionId) return;
    try {
      await loadMoreQuestionAnswers(questionId);
    } catch (e) {
      console.error('加载更多回答失败:', e);
    }
  };

  return (
    <View className="questionInfo_page_container">
      <View className="questionInfo_page_comment_wrapper">
        {question && (
          <FeedCard
            comment={{
              id: question.id,
              content: question.content,
              course_id: question.biz_id,
              publisher_id: question.questioner_id,
              ctime: question.ctime,
              total_comment_count: question.answer_cnt || answers.length,
            }}
            showAll
            type="inner"
            hideStar
          />
        )}
      </View>

      <View className="questionInfo_page_comments_title">评论区</View>
      <View className="questionInfo_page_divider" />

      <View className="questionInfo_page_comments_list">
        <ReviewDiscussion
          key={activeQuestionId ?? 'none'}
          comments={normalizedAnswers}
          hasMore={answersHasMore}
          initialLoading={!answersLoaded}
          onLoadMore={loadMoreAnswers}
        />
      </View>
      <BottomInput ref={bottomInputRef} onSubmit={handleReplySubmit} />
    </View>
  );
};

export default Page;
