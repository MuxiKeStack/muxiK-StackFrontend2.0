import '@/common/components/QuestionDetail/QuestionDetail';
import { Image, Text, View } from '@tarojs/components';
import React, { useEffect, useState } from 'react';

import answericon from '@/common/assets/img/publishQuestion/answer.png';
import askicon from '@/common/assets/img/publishQuestion/ask.png';
import IconFont from '@/common/components/iconfont';
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
    <View className="relative mx-auto flex w-[659.42rpx] flex-col items-center bg-[#f9f9f2]">
      <View className="w-[603.26rpx] border-b border-[#e3e3e3] pb-[35rpx] pt-[40rpx]">
        <PublishHeader
          avatarUrl={questionDetail?.user?.avatar ?? ''}
          nickName={questionDetail?.user?.nickname ?? ''}
          date={formatTime(questionDetail?.ctime)}
        />
        <View className="mt-[20rpx] flex">
          <Image
            src={askicon as string}
            className="ml-[10rpx] mr-[20rpx] h-[47.05rpx] w-[44.44rpx]"
          />
          <View className="mt-[5rpx] max-w-[471rpx] text-[21.74rpx] text-[#565552]">
            {question.content}
          </View>
        </View>
      </View>

      <View className="w-full">
        {answersDetail &&
          answersDetail.map((answer, index) => (
            <View
              key={index}
              className="mx-auto w-[603.26rpx] border-b border-[#e3e3e3] pb-[35rpx] pt-[40rpx]"
              onClick={() => handleFloatLayoutChange(answer.id)}
            >
              <PublishHeader
                avatarUrl={answer?.user?.avatar ?? ''}
                nickName={answer?.user?.nickname ?? ''}
                date={formatTime(answer.ctime)}
              />
              <View className="mt-[20rpx] flex">
                <Image src={answericon as string} className="h-[47.05rpx] w-[44.44rpx]" />
                <View className="mt-[5rpx] max-w-[471rpx] text-[21.74rpx] text-[#565552]">
                  {answer?.content}
                </View>
              </View>
              <View className="ml-[450rpx] flex items-center">
                <View className="inline-block h-[40rpx] w-[40rpx] rounded-full text-center leading-[40rpx] shadow-md">
                  <IconFont name="comment" />
                </View>
                <Text className="mx-[10rpx] text-[22rpx] font-bold text-[#565552]">
                  {answer.total_comment_count}
                </Text>
                <View className="inline-block h-[40rpx] w-[40rpx] rounded-full text-center leading-[40rpx] shadow-md">
                  <IconFont name="like" />
                </View>
                <Text className="mx-[10rpx] text-[22rpx] font-bold text-[#565552]">
                  {answer.total_support_count}
                </Text>
              </View>
            </View>
          ))}
      </View>
    </View>
  );
};

export default QuestionDetail;
