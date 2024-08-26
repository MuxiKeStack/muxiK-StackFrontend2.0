/* eslint-disable @typescript-eslint/no-unsafe-member-access */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable import/first */
import { Text, View } from '@tarojs/components';
import { useEffect, useState } from 'react';

import './index.scss';

// import echarts from '../../assets/js/echarts.js'
import Charts from '@/common/components/chart';
import Label3 from '@/common/components/label3/label3';
import ShowStar from '@/common/components/showStar/showStar';
import { get } from '@/common/utils/fetch';
// 定义接口
interface Course {
  id: number;
  name: string;
  teacher: string;
  school: string;
  type: string;
  credit: number;
  composite_score: number;
  rater_count: number;
  assessments: Record<string, never>; // 使用 Record 类型来表示对象，具体类型根据实际结构定义
  features: Record<string, never>;
  is_collected: boolean;
  is_subscribed: boolean;
}

export default function index() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [course, setCourse] = useState<Course | null>(null);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/require-await
    const getCourseData = async () => {
      try {
        void get(`/courses/1/detail`, true).then((res) => {
          console.log(res);
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          setCourse(res.data);
        });
      } catch (error) {
        // 错误处理，例如弹出提示
        console.error('Failed to fetch course data:', error);
      }
    };

    void getCourseData().then((r) => console.log(r));
  }, []); // 空依赖数组确保仅在组件挂载时执行

  const commentExample = {
    username: '昵称',
    score: 3.5,
    isHot: false,
    date: '2023.7.13',
    time: '16:30',
    content:
      '评价斤斤计较斤斤计较急急急急急急急急急斤斤计较急急急急急急急急急急急急急急急斤斤计较急急急急急急急急急急急急急急急cfadsutfc7acga促使第一次给有多个素材u辛苦参赛的他u发出委托方徐v阿托伐窜同时1蓄西安粗体为擦u逃窜他敦促台湾的垡等下颚骨我发帖都要',
    like: 123,
    comment: 123,
    dislike: 123,
  };

  if (!course) {
    return <Text>Loading...</Text>; // 数据加载中
  }

  // @ts-ignore
  // @ts-ignore
  // @ts-ignore
  // @ts-ignore
  return (
    <View className="classInfo">
      <View className="theClassnme">{course?.name}</View>
      <View className="teacherName">
        {course.school} {course.teacher}
      </View>
      <View className="p">
        综合评分: <ShowStar score={course.composite_score} />
        <Text>（共{course.rater_count}人评价）</Text>
      </View>
      <View className="p">
        课程分类: <Label3 content={course.type} />
      </View>
      <View className="p">
        课程特点: {}
        {/* @ts-ignore*/}
        {course.features.map((feature) => (
          <Label3 content={feature}></Label3>
        ))}
      </View>
      <Charts options={}></Charts>
      {/* <Comment {...commentExample} /> */}
    </View>
  );
}
