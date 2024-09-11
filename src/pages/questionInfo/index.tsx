import { View } from '@tarojs/components';
import React, { useEffect, useState } from 'react';

import { Course } from '@/common/assets/types';
import CourseInfo from '@/common/components/CourseInfo/CourseInfo';
import QuestionDetail from '@/common/components/QuestionDetail/QuestionDetail'; // 假设你的组件文件名为QuestionDetail.tsx
import { get } from '@/common/utils/fetch';

const Index: React.FC = () => {
  const question = {
    id: 5,
    questioner_id: 5208,
    biz: 'Course',
    biz_id: 2347,
    content: '这节课怎么样？',
    answer_cnt: 0,
    preview_answers: null,
    utime: 1725039765090,
    ctime: 1725039765090,
  };

  const answers = [
    {
      id: 5,
      publisher_id: 5208,
      question_id: 5,
      content: '我觉得很不错',
      stance: 0,
      total_support_count: 0,
      total_oppose_count: 0,
      total_comment_count: 0,
      utime: 1725039834700,
      ctime: 1725039834700,
    },
  ];

  const [course, setCourse] = useState<Course | null>(null);

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
  }, [courseId]); // 在courseId变化时运行

  return (
    <View>
      <CourseInfo name={course?.name} school={course?.school} teacher={course?.teacher} />
      <QuestionDetail question={question} answers={answers} />
    </View>
  );
};

export default Index;
