import '@/common/components/QuestionDetail/QuestionDetail';
import { Button, Icon, Image, Text, Textarea, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import React, { useEffect, useState } from 'react';

import { TopBackground } from '@/common/assets/img/login';
import answericon from '@/common/assets/img/publishQuestion/answer.png';
import askicon from '@/common/assets/img/publishQuestion/ask.png';
import IconFont from '@/common/components/iconfont';
import PublishHeader from '@/common/components/PublishHeader/PublishHeader';
import { get, post } from '@/common/utils';
import { postBool } from '@/common/utils/fetch';
import { StatusResponse } from '@/pages/evaluate/evaluate';
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
  onAnswer?: (questionId: number) => void;
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
  onAnswer,
}) => {
  const dispatch = useCourseStore(({ getPublishers }) => ({ getPublishers }));

  const [questionDetail, setQuestion] = useState<IQuestion>(question);
  const [answersDetail, setAnswersDetail] = useState<IAnswer[] | null>(answers);
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [answerContent, setAnswerContent] = useState('');

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
        setAnswersDetail(answersWithUserInfo);
      } else {
        // 如果 answers 为 null，可以选择设置一个空数组或者执行其他逻辑
        setAnswersDetail([]);
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
  }, [question]);

  const handlePublishAnswer = async () => {
    if (!answerContent.trim()) return;

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const response = await post('/answers/publish', {
        content: answerContent,
        question_id: question.id,
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (response?.code === 409002) {
        void Taro.showToast({
          title: '不能回答未上过的课',
          icon: 'none',
          duration: 2000,
        });
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (response?.code === 0) {
        setAnswerContent('');
        setShowAnswerForm(false);

        // 刷新回答列表
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const res = await get(
            `/answers/list/questions/${question.id}?cur_answer_id=${0}&limit=${100}`
          );
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          setAnswersDetail(res?.data as IAnswer[]);

          void Taro.showToast({
            title: '回答发布成功',
            icon: 'success',
            duration: 2000,
          });
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error('获取回答列表失败:', errorMessage);
        }
      }
    } catch (error) {
      console.error('发布回答失败:', error);
      void Taro.showToast({
        title: '发布回答失败',
        icon: 'error',
        duration: 2000,
      });
    }
  };
  const [test, setTest] = useState<boolean>(false);
  useEffect(() => {
    const getParams = async () => {
      try {
        const res = (await postBool('/checkStatus', {
          name: 'kestack',
        })) as StatusResponse;

        setTest(res.data.status);
      } catch (error) {
        console.error('Error fetching status:', error);
      }
    };

    void getParams();
  }, []);
  useEffect(() => {
    console.log('test status updated:', test);
  }, [test]);
  return !test ? (
    <View className="flex flex-col">
      <Image src={TopBackground as string} className="w-full"></Image>
      <View className="absolute top-0 mt-[15vh] flex w-full flex-col items-center gap-4">
        <View className="h-40 w-40 overflow-hidden rounded-2xl shadow-xl">
          <Image src={Icon as unknown as string} className="h-full w-full"></Image>
        </View>
        <Text className="text-3xl font-semibold tracking-widest text-[#FFD777]">
          木犀课栈
        </Text>
      </View>
    </View>
  ) : (
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
      <View className="w-full pb-[180rpx]">
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
      <View className="shadow-up fixed bottom-0 left-0 right-0 bg-[#f9f9f2] px-[28rpx] py-[20rpx]">
        {!showAnswerForm ? (
          <Button
            className="h-[8vh] w-[90vw] rounded-lg bg-[#f18900] py-[20rpx] text-white"
            onClick={() => setShowAnswerForm(true)}
          >
            写回答
          </Button>
        ) : (
          <View className="w-full">
            <Textarea
              className="mb-[20rpx] min-h-[200rpx] w-full rounded-lg border border-gray-200 bg-[#f9f9f2] p-[20rpx]"
              value={answerContent}
              onInput={(e) => setAnswerContent(e.detail.value)}
              placeholder="请输入您的回答..."
            />
            <View className="flex justify-end space-x-[20rpx]">
              <Button
                className="rounded-lg bg-gray-200 px-[30rpx] text-gray-600"
                onClick={() => {
                  setShowAnswerForm(false);
                  setAnswerContent('');
                }}
              >
                取消
              </Button>
              <Button
                className="rounded-lg bg-[#f18900] px-[30rpx] text-white"
                onClick={() => void handlePublishAnswer()}
              >
                发布回答
              </Button>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

export default QuestionDetail;
