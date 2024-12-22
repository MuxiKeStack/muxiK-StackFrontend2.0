/* eslint-disable no-console */
import { Button, Image, Text, View } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { useEffect, useState } from 'react';

// import './index.scss';
import { Icon, TopBackground } from '@/common/assets/img/login';
import CourseInfo from '@/common/components/CourseInfo/CourseInfo';
import QuestionListComponent from '@/common/components/QuestionListComponent/QuestionListComponent';
import { get } from '@/common/utils';
import { postBool } from '@/common/utils/fetch';

import { StatusResponse } from '../evaluate/evaluate';

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
  }>;
  utime: number;
  ctime: number;
}

const App = () => {
  const [course, setCourse] = useState<Course | null>(null);
  const [questions, setQuestions] = useState<IQuestion[] | null>(null);
  const [courseId, setCourseId] = useState<string>('');
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
  useEffect(() => {
    const getParams = () => {
      const instance = Taro.getCurrentInstance();
      const params = instance?.router?.params || {};

      if (params.course_id) setCourseId(params.course_id);
    };

    getParams();
  }, []);
  // eslint-disable-next-line @typescript-eslint/require-await
  const getQuestionList = async () => {
    try {
      void get(
        `/questions/list?biz=Course&biz_id=${courseId}&cur_question_id=0&limit=100`
      ).then((res) => {
        // 检查 res 是否有 data 属性，并且断言其类型
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        setQuestions(res?.data as IQuestion[]);
      });
    } catch (error) {
      // 错误处理，例如弹出提示
      console.error('Failed to fetch course data:', error);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/require-await
    const getCourseData = async () => {
      try {
        void get(`/courses/${courseId}/detail`).then((res) => {
          // 检查 res 是否有 data 属性，并且断言其类型
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          setCourse(res?.data as Course);
        });
      } catch (error) {
        // 错误处理，例如弹出提示
        console.error('Failed to fetch course data:', error);
      }
    };

    if (courseId) void getCourseData();

    if (courseId) void getQuestionList().then((r) => console.log(r));
  }, [courseId]);
  useDidShow(() => {
    if (courseId) void getQuestionList().then((r) => console.log(r));
  });

  const handleAsk = () => {
    void Taro.navigateTo({
      url: `/pages/publishQuestion/index?course_id=${courseId}`,
    });
  };

  return !test ? (
    <View className="flex flex-col">
      <Image src={TopBackground as string} className="w-full"></Image>
      <View className="absolute top-0 mt-[15vh] flex w-full flex-col items-center gap-4">
        <View className="h-40 w-40 overflow-hidden rounded-2xl shadow-xl">
          <Image src={Icon as string} className="h-full w-full"></Image>
        </View>
        <Text className="text-3xl font-semibold tracking-widest text-[#FFD777]">
          木犀课栈
        </Text>
      </View>
    </View>
  ) : (
    <View>
      <CourseInfo name={course?.name} school={course?.school} teacher={course?.teacher} />
      {questions !== null &&
        questions.map((question, index) => (
          <QuestionListComponent key={index} question={question} courseId={courseId} />
        ))}
      <Button className="btn" onClick={handleAsk}>
        我也要提问
      </Button>
    </View>
  );
};

export default App;
