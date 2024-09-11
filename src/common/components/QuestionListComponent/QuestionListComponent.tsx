/* eslint-disable import/first */
import { Image, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import React, { useEffect, useState } from 'react';

import './index.scss';

import answericon from '@/common/assets/img/publishQuestion/answer.png';
import askicon from '@/common/assets/img/publishQuestion/ask.png';
import PublishHeader from '@/common/components/PublishHeader/PublishHeader';
import { useCourseStore } from '@/pages/main/store/store';

interface IUser {
  avatar: string;
  id: number;
  nickname: string;
}

interface IQuestion {
  id: number;
  questioner_id: number;
  biz: string;
  biz_id: number;
  content: string;
  answer_cnt: number;
  preview_answers: Array<{
    id: number;
    publisher_id: number;
    question_id: number;
    content: string;
    utime: number;
    ctime: number;
    user?: IUser;
  }>;
  utime: number;
  ctime: number;
  user?: IUser;
}

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hour = date.getHours().toString().padStart(2, '0');
  const minute = date.getMinutes().toString().padStart(2, '0');
  const second = date.getSeconds().toString().padStart(2, '0');
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
};

const QuestionListComponent: React.FC<{ question: IQuestion }> = ({ question }) => {
  const dispatch = useCourseStore(({ getPublishers }) => ({ getPublishers }));

  const [questionDetail, setQuestion] = useState<IQuestion>(question);

  useEffect(() => {
    const fetchQuestionWithUserInfo = async () => {
      try {
        const user = await dispatch.getPublishers(question.questioner_id);
        const questionWithUserInfo = { ...question, user };
        setQuestion(questionWithUserInfo);

        // 检查 preview_answers 是否存在并且是一个数组
        const previewAnswersWithUserInfo =
          question.preview_answers && question.preview_answers.length > 0
            ? await Promise.all(
                question.preview_answers.map(async (answer) => {
                  const newuser = await dispatch.getPublishers(answer.publisher_id);
                  return { ...answer, newuser };
                })
              )
            : [];

        // 更新问题状态，包括填充了用户信息的 preview_answers
        setQuestion((prev) => ({
          ...prev,
          user: questionWithUserInfo.user, // 确保用户信息被设置
          preview_answers: previewAnswersWithUserInfo,
        }));
      } catch (error) {
        console.error('Error fetching question with user info:', error);
      }
    };

    void fetchQuestionWithUserInfo();
  }, [question]);

  const handleQuestionDetailClick = () => {
    void Taro.navigateTo({
      url: `/pages/questionInfo/index?id=${questionDetail.id}`,
    });
  };

  return (
    <View className="questionDetail" onClick={handleQuestionDetailClick}>
      <View className="question-detail">
        <PublishHeader
          avatarUrl={questionDetail?.user?.avatar ?? ''}
          nickName={questionDetail?.user?.nickname ?? ''}
          date={formatTime(questionDetail?.ctime)}
        />
        <View className="question-item">
          {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            <Image src={askicon} className="askicon" />
          }
          <View className="question-value">{questionDetail.content}</View>
        </View>
      </View>
      <View className="answer-list">
        {questionDetail.preview_answers &&
          questionDetail.preview_answers.map((answer, index) => (
            <View key={index} className="answer-item">
              <PublishHeader
                avatarUrl={answer?.user?.avatar ?? ''}
                nickName={answer?.user?.nickname ?? ''}
                date={formatTime(answer.ctime)}
              />
              <View className="question-item">
                {
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                  <Image src={answericon} className="askicon" />
                }
                <View className="answer-content">{answer.content}</View>
              </View>
            </View>
          ))}
      </View>
    </View>
  );
};

export default QuestionListComponent;
