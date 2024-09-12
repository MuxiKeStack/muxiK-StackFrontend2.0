import { Image, Text, View } from '@tarojs/components';
import React, { useEffect, useState } from 'react';

import './index.scss';

// eslint-disable-next-line import/first
import answericon from '@/common/assets/img/publishQuestion/answer.png';
// eslint-disable-next-line import/first
import askicon from '@/common/assets/img/publishQuestion/ask.png';
// eslint-disable-next-line import/first
import PublishHeader from '@/common/components/PublishHeader/PublishHeader';
// eslint-disable-next-line import/first
import { useCourseStore } from '@/pages/main/store/store';

import IconFont from '../iconfont';

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
  answers: IAnswer[] | null;
  handleFloatLayoutChange: (answerId: number | null) => void;
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

const QuestionDetail: React.FC<IQuestionProps> = ({
  question,
  answers,
  handleFloatLayoutChange,
}) => {
  const dispatch = useCourseStore(({ getPublishers }) => ({ getPublishers }));

  const [questionDetail, setQuestion] = useState<IQuestion>(question);
  const [answersDetail, setAnswers] = useState<IAnswer[] | null>(answers);

  useEffect(() => {
    const fetchAllPublishers = async () => {
      // 函数，用于获取每个答案的用户信息
      async function getAnswersWithUserInfo(ianswers: IAnswer[]) {
        try {
          const answersWithUserInfo = await Promise.all(
            ianswers.map(async (answer) => {
              const user = await dispatch.getPublishers(answer.publisher_id);
              return { ...answer, user };
            })
          );
          return answersWithUserInfo;
        } catch (error) {
          // 处理错误，返回一个空数组或其他适当的默认值
          console.error('Error fetching user info:', error);
          return []; // 返回一个空数组
        }
      }

      // 确保 answers 不为 null
      if (answers !== null) {
        const answersWithUserInfo = await getAnswersWithUserInfo(answers);
        setAnswers(answersWithUserInfo);
      } else {
        // 如果 answers 为 null，可以选择设置一个空数组或者执行其他逻辑
        setAnswers([]);
      }

      // 函数，用于获取问题的提问者用户信息
      async function getQuestionWithUserInfo(iquestion: IQuestion) {
        try {
          const user = await dispatch.getPublishers(iquestion.questioner_id);
          const questionWithUserInfo = { ...iquestion, user };
          return questionWithUserInfo;
        } catch (error) {
          console.error('Error fetching question with user info:', error);
          throw error; // 重新抛出错误，可以在调用此函数的地方进行处理
        }
      }

      // 调用函数并处理结果
      const questionWithUserInfo = await getQuestionWithUserInfo(question);
      setQuestion(questionWithUserInfo);
    };

    void fetchAllPublishers();
  }, [question, answers]);
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
        {answersDetail &&
          answersDetail.map((answer, index) => (
            <View
              key={index}
              className="answer-item"
              onClick={() => handleFloatLayoutChange(answer.id)}
            >
              <PublishHeader
                avatarUrl={answer?.user?.avatar ?? ''}
                nickName={answer?.user?.nickname ?? ''}
                date={formatTime(answer.ctime)}
              />
              <View className="question-item">
                {
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                  <Image src={answericon} className="askicon"></Image>
                }
                <View className="answer-content">{answer?.content}</View>
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
