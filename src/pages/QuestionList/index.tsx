// import React from 'react';
import { Course } from '@/common/assets/types';
import CourseInfo from '@/common/components/CourseInfo/CourseInfo';
import QuestionListComponent from '@/common/components/QuestionListComponent/QuestionListComponent';
import { get } from '@/common/utils/fetch';
import { View } from '@tarojs/components';
import { useEffect, useState } from 'react';

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
  //   const questions = [
  //     {
  //       "id": 5,
  //       "questioner_id": 5208,
  //       "biz": "Course",
  //       "biz_id": 2347,
  //       "content": "这节课怎么样？",
  //       "answer_cnt": 0,
  //       "preview_answers": [
  //           {
  //               "id": 5,
  //               "publisher_id": 5208,
  //               "question_id": 5,
  //               "content": "我觉得很不错",
  //               "utime": 1725039834700,
  //               "ctime": 1725039834700
  //           }
  //       ],
  //       "utime": 1725039765090,
  //       "ctime": 1725039765090
  //     }
  //   ];

  const [course, setCourse] = useState<Course | null>(null);
  const [questions, setQuestions] = useState<IQuestion[] | null>(null);
  const courseId = 2347; //先用概率统计A来调试吧

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
    const getQuestionList = async () => {
      try {
        void get(
          `/questions/list?biz=Course&biz_id=${courseId}&cur_question_id=0&limit=100`,
          true
        ).then((res) => {
          console.log(res);
          // 检查 res 是否有 data 属性，并且断言其类型
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          setQuestions(res?.data as IQuestion[]);
        });
      } catch (error) {
        // 错误处理，例如弹出提示
        console.error('Failed to fetch course data:', error);
      }
    };

    if (courseId) void getQuestionList().then((r) => console.log(r));
  }, [courseId]);

  return (
    <View>
      <CourseInfo name={course?.name} school={course?.school} teacher={course?.teacher} />
      {questions !== null &&
        questions.map((question, index) => (
          <QuestionListComponent key={index} question={question} />
        ))}
    </View>
  );
};

export default App;
