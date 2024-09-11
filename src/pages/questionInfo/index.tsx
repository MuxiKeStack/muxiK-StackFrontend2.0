import { Course } from '@/common/assets/types';
import CourseInfo from '@/common/components/CourseInfo/CourseInfo';
import QuestionDetail from '@/common/components/QuestionDetail/QuestionDetail'; // 假设你的组件文件名为QuestionDetail.tsx
import { get } from '@/common/utils/fetch';
import { View } from '@tarojs/components';
import React, { useEffect, useState } from 'react';
import Taro from '@tarojs/taro';

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
}

const Index: React.FC = () => {
  // const question = {
  //   id: 5,
  //   questioner_id: 5208,
  //   biz: 'Course',
  //   biz_id: 2347,
  //   content: '这节课怎么样？',
  //   answer_cnt: 0,
  //   preview_answers: null,
  //   utime: 1725039765090,
  //   ctime: 1725039765090,
  // };

  // const answers = [
  //   {
  //     id: 5,
  //     publisher_id: 5208,
  //     question_id: 5,
  //     content: '我觉得很不错',
  //     stance: 0,
  //     total_support_count: 0,
  //     total_oppose_count: 0,
  //     total_comment_count: 0,
  //     utime: 1725039834700,
  //     ctime: 1725039834700,
  //   },
  // ];

  const [course, setCourse] = useState<Course | null>(null);

  const [question,setQuestion] = useState<IQuestion | null>(null);

  const [answers,setAnswers] = useState<IAnswer[] | null>(null);

  

  const courseId = 2347; //先用概率统计A来调试吧
  const [questionId,setQuestionId] = useState<String | null>(null);

  // const questionId = 5; 

  useEffect(() => {
    const getParams = () => {
      const instance = Taro.getCurrentInstance();
      // 使用可选链操作符安全访问 router 和 params
      const params = instance?.router?.params || {};

      if (params.id) setQuestionId(params.id);
    };

    getParams();
  }, []); // 这个 effect 仅在组件挂载时运行一次

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/require-await
    const getCourseData = async () => {
      try {
        void get(`/courses/${courseId}/detail`, true).then((res) => {
          console.log(res);
          // 检查 res 是否有 data 属性，并且断言其类型
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          setCourse(res?.data as Course);
        });
      } catch (error) {
        // 错误处理，例如弹出提示
        console.error('Failed to fetch course data:', error);
      }
    };

    if (courseId) void getCourseData().then((r) => console.log(r));

    // eslint-disable-next-line @typescript-eslint/require-await
    const getQuestionDetail = async () => {
      try {
        void get(`/questions/${questionId}/detail`, true).then((res) => {
          console.log(res);
          // 检查 res 是否有 data 属性，并且断言其类型
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          setQuestion(res?.data as IQuestion);
        });
      } catch (error) {
        // 错误处理，例如弹出提示
        console.error('Failed to fetch course data:', error);
      }
    };

    if (courseId) void getQuestionDetail().then((r) => console.log(r));
    
    // eslint-disable-next-line @typescript-eslint/require-await
    const getAnswersList = async () => {
      try {
        void get(`/answers/list/questions/${questionId}?cur_answer_id=0&limit=100`, true).then((res) => {
          console.log(res);
          // 检查 res 是否有 data 属性，并且断言其类型
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          setAnswers(res?.data as IAnswer[]);
        });
      } catch (error) {
        // 错误处理，例如弹出提示
        console.error('Failed to fetch course data:', error);
      }
    };

    if (courseId) void getAnswersList().then((r) => console.log(r));

  }, [courseId,questionId]); // 在courseId变化时运行

  return (
    <View>
      <CourseInfo name={course?.name} school={course?.school} teacher={course?.teacher} />
      {
        question ?
        <QuestionDetail question={question} answers={answers} />
        : ''
      }
      
    </View>
  );
};

export default Index;
