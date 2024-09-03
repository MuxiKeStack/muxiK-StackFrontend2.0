import PublishHeader from '@/common/components/PublishHeader/PublishHeader';
import { useCourseStore } from '@/pages/main/store/store';
import { Image, Text, View } from '@tarojs/components';
import React, { useEffect, useState } from 'react';
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
import askicon from '@/common/assets/img/publishQuestion/ask.png';
import IconFont from '../iconfont';

import './index.scss';

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
  preview_answers: null | Array<{
    id: number;
    publisher_id: number;
    question_id: number;
    content: string;
    utime: number;
    ctime: number;
  }>;
  utime: number;
  ctime: number;
  user?: IUser;
}

interface IAnswer {
  id: number;
  publisher_id: number;
  question_id: number;
  content: string;
  stance: number;
  total_support_count: number;
  total_oppose_count: number;
  total_comment_count: number;
  utime: number;
  ctime: number;
  user?: IUser;
}

interface IQuestionProps {
  question: IQuestion;
  answers: IAnswer[];
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

const QuestionDetail: React.FC<IQuestionProps> = ({ question, answers }) => {
  const dispatch = useCourseStore(({ getPublishers }) => ({ getPublishers }));

  const [questionDetail, setQuestion] = useState<IQuestion>(question);
  const [answersDetail, setAnswers] = useState<IAnswer[]>(answers);

  useEffect(() => {
    const fetchAllPublishers = async () => {
      // 函数，用于获取每个答案的用户信息
      async function getAnswersWithUserInfo(answers) {
        const answersWithUserInfo = await Promise.all(
          answers.map(async (answer) => {
            const user = await dispatch.getPublishers(answer.publisher_id);
            return { ...answer, user };
          })
        );
        return answersWithUserInfo;
      }

      // 调用函数并处理结果
      getAnswersWithUserInfo(answers)
        .then((answersWithUserInfo) => {
          setAnswers(answersWithUserInfo);
        })
        .catch((error) => {
          console.error('Error fetching answers with user info:', error);
        });

      // 函数，用于获取问题的提问者用户信息
      async function getQuestionWithUserInfo(question) {
        try {
          const user = await dispatch.getPublishers(question.questioner_id);
          const questionWithUserInfo = { ...question, user };
          return questionWithUserInfo;
        } catch (error) {
          console.error('Error fetching question with user info:', error);
          throw error; // 重新抛出错误，可以在调用此函数的地方进行处理
        }
      }

      // 调用函数并处理结果
      getQuestionWithUserInfo(question)
        .then((questionWithUserInfo) => {
          setQuestion(questionWithUserInfo);
        })
        .catch((error) => {
          console.error('Failed to fetch question with user info:', error);
        });
    };

    fetchAllPublishers();
  });
  return (
    <View className="questionDetail">
      <View className="question-detail">
        <PublishHeader
          avatarUrl={questionDetail?.user?.avatar ?? ''}
          nickName={questionDetail?.user?.nickname ?? ''}
          date={formatTime(questionDetail?.ctime)}
        />
        <View className="question-item">
          {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            <Image src={askicon} className="askicon"></Image>
          }
          <View className="question-value">{question.content}</View>
        </View>
      </View>
      <View className="answer-list">
        {answersDetail.map((answer, index) => (
          <View key={index} className="answer-item">
            <PublishHeader
              avatarUrl={answer?.user?.avatar ?? ''}
              nickName={answer?.user?.nickname ?? ''}
              date={formatTime(answer.ctime)}
            />
            <View className="question-item">
              {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                <Image src={askicon} className="askicon"></Image>
              }
              <View className="answer-content">
                {
                  '本网站使用cookies以提升您的使用体验及统计网站流量相关数据。继续使用本网站表示您同意我们使用cookies。我们的《隐私及Cookie政策》提供更多关于cookies使用及停用的相关信息。'
                }
              </View>
            </View>
            <View className="answer-statistics">
              <View className="icon">
                <IconFont name="comment" />
                {/* <Navigator className="iconfont">&#xe769;</Navigator> */}
              </View>
              <Text className="text1">{answer.total_comment_count}</Text>
              <View className="icon">
                <IconFont name="like" />
                {/* <Navigator className="iconfont">&#xe786;</Navigator> */}
              </View>
              <Text className="text1">{answer.total_support_count}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default QuestionDetail;
