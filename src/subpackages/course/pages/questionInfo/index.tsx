import { BottomInput, FeedCard, ReviewDiscussion } from '@/common/components';
import type { BottomInputRef } from '@/common/components/BottomInput';
import { useAuthGuard } from '@/common/hooks/useAuthGuard';
import { getAnswerDetail } from '@/common/request/api/answers';
import { bus } from '@/common/utils';
import { useCourseStore } from '@/store/useCourseStore';
import { useQuestionDetailStore } from '@/store/useQuestionDetailStore';
import { useUserStore } from '@/store/useUserStore';
import { View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import './index.scss';

const Page: React.FC = () => {
  const { guard } = useAuthGuard();
  const question = useQuestionDetailStore((s) => s.question);
  const answers = useQuestionDetailStore((s) => s.answers);
  const answersHasMore = useQuestionDetailStore((s) => s.answersHasMore);
  const answersLoaded = useQuestionDetailStore((s) => s.answersLoaded);
  const publishers = useCourseStore((s) => s.publishers);
  const bottomInputRef = useRef<BottomInputRef>(null);

  const handleReplySubmit = useCallback(
    async (value: string) => {
      const questionId = question?.id;
      if (!value.trim() || !questionId || !guard()) return;

      const profile = useUserStore.getState().profile;
      const newAnswer = {
        id: -Date.now(),
        publisher_id: 0,
        question_id: questionId,
        content: value,
        stance: 0,
        total_support_count: 0,
        total_comment_count: 0,
        utime: Date.now() / 1000,
        ctime: Date.now() / 1000,
        publisher: {
          id: 0,
          avatar: profile?.avatar || '',
          nickname: profile?.nickname || '我',
        },
      };

      useQuestionDetailStore.setState((s) => ({
        answers: [newAnswer, ...s.answers],
      }));

      try {
        await useQuestionDetailStore.getState().publishReply(questionId, value);
        bottomInputRef.current?.clearValue();
        useQuestionDetailStore.setState((s) => {
          if (!s.question) return s;
          const updated = {
            ...s.question,
            answer_cnt: (s.question.answer_cnt || 0) + 1,
            preview_answers: [
              { id: newAnswer.id, content: newAnswer.content },
              ...(s.question.preview_answers || []),
            ],
          };
          bus.emit('question', updated);
          return { question: updated };
        });
      } catch {
        Taro.showToast({ title: '发布失败', icon: 'error' });
      }
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

  useEffect(() => {
    void (async () => {
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

      if (qid > 0) {
        void useQuestionDetailStore.getState().loadQuestion(qid);
        void useQuestionDetailStore.getState().loadAnswers(qid);
      }
    })();
  }, []);

  const loadMoreAnswers = async () => {
    const questionId = question?.id;
    if (!questionId) return;
    try {
      await useQuestionDetailStore.getState().loadMoreAnswers(questionId);
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
