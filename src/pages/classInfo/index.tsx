/* eslint-disable @typescript-eslint/no-unsafe-member-access */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/* eslint-disable import/first */
import { Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useEffect, useMemo, useState } from 'react';

import './index.scss';

import { CommentInfoType, Course } from '@/common/assets/types';
import { Comment } from '@/common/components';
import AnswerToStudent from '@/common/components/AnswerToStudent';
import LineChart from '@/common/components/chart';
import Label3 from '@/common/components/label3/label3';
import ShowStar from '@/common/components/showStar/showStar';
import { GradeChart, WebQuestionVo } from '@/common/types/userTypes';
import { get } from '@/common/utils/fetch';

const coursePropertyMap = {
  CoursePropertyGeneralCore: '通识核心课',
  CoursePropertyGeneralElective: '通识选修课',
  CoursePropertyGeneralRequired: '通识必修课',
  CoursePropertyMajorCore: '专业主干课程',
  CoursePropertyMajorElective: '个性发展课程',
};

// 编写一个函数来根据英文描述获取中文描述
function translateCourseProperty(englishDescription) {
  // 使用数组的 find 方法查找匹配的项
  const entry = Object.entries(coursePropertyMap).find(
    ([key]) => key === englishDescription
  );

  // 如果找到了匹配项，返回中文描述，否则返回未找到的消息
  return entry ? entry[1] : '未找到对应的中文描述';
}

export default function Index() {
  const [course, setCourse] = useState<Course | null>(null);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [comments, setComments] = useState<CommentInfoType[]>([]);
  const [grade, setGrade] = useState<GradeChart>();
  const [questionNum, setQuestionNum] = useState<number>(0);
  const [questionlist, setQuestionlist] = useState<WebQuestionVo[]>([]);
  useEffect(() => {
    const getParams = () => {
      const instance = Taro.getCurrentInstance();
      const params = instance?.router?.params || {};

      if (params.course_id) setCourseId(params.course_id);
    };

    getParams();
  }, []);
  //获取问题个数
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/require-await
    const getCourseData = async () => {
      try {
        void get(`/courses/${courseId}/detail`, true).then((res) => {
          console.log(res);
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          setCourse(res.data);
        });
      } catch (error) {
        console.error('Failed to fetch course data:', error);
      }
    };

    if (courseId) void getCourseData().then((r) => console.log(r));

    // eslint-disable-next-line @typescript-eslint/require-await
    const getCommentData = async () => {
      try {
        void get(
          `/evaluations/list/courses/${courseId}?cur_evaluation_id=0&limit=100`,
          true
        ).then((res) => {
          console.log(res);
          setComments(res.data as CommentInfoType[]);
        });
      } catch (error) {
        console.error('Failed to fetch course data:', error);
      }
    };

    if (courseId) void getCommentData();
  }, [courseId]);
  useEffect(() => {
    console.log('test', courseId);
    const fetchGrades = async () => {
      try {
        await get(`/grades/courses/${courseId}`, true).then((res) => {
          console.log(res.data);
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          setGrade(res.data); // 设置 grade 数据
        });
      } catch (err) {
        console.error('Failed to fetch grades data', err);
      }
    };
    const getNumData = () => {
      try {
        console.log('test', courseId);
        void get(`/questions/count?biz=Course&biz_id=${courseId}`, true).then((res) => {
          console.log(res);
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          setQuestionNum(res.data);
        });
      } catch (e) {
        console.error(e);
      }
    };
    const fetchAnswer = async () => {
      try {
        await get(
          `/questions/list?biz=Course&biz_id=${courseId}&cur_question_id=&limit=`,
          true
        ).then((res) => {
          console.log(res);
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          setQuestionlist(res.data);
        });
      } catch (e) {
        console.error('Failed to fetch course data:', e);
      }
    };
    if (courseId) {
      void fetchGrades();
      void getNumData();
      void fetchAnswer();
    }
  }, [courseId]);
  const xLabels = useMemo(
    () => ['0-40', '40-50', '50-60', '60-70', '70-80', '80-90', '90-100'],
    []
  );
  const { heightLightPercent, yData } = useMemo(() => {
    const percent = (grade?.avg ?? 0) / 10;
    return {
      heightLightPercent: percent > 4 ? percent - 3 : 0,
      yData: grade?.grades.map((item) => item.total_grades?.length ?? 0),
    };
  }, [grade]);
  if (!course || !grade) {
    return <Text>请先确定已签约成绩共享计划</Text>; // 数据加载中
  }
  const featuresList =
    course.features && Array.isArray(course.features) ? course.features : [];

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
        课程分类: <Label3 content={translateCourseProperty(course.type)} />
      </View>
      <View className="p">
        课程特点: {}
        {featuresList.map((feature, keyindex) => (
          <Label3 key={keyindex} content={feature} />
        ))}
      </View>
      <View className="h-1/3 pt-1.5">
        <LineChart
          className="mx-auto text-center"
          data={yData}
          xLabels={xLabels}
          heightLightPercent={heightLightPercent ?? 0}
          title={`平均分: ${grade?.avg.toFixed(1)}`}
        />
      </View>
      <View>
        <View>
          <View className="line-container pt-2.5 text-center text-xl">
            问问同学({questionNum})
          </View>
        </View>
        <>
          {questionlist &&
            questionlist.map((question) => (
              <AnswerToStudent
                content={question.content}
                key={question.id}
                preview_answers={question.preview_answers}
              />
            ))}
        </>
        {questionlist.length > 0 && (
          <View
            onClick={() => {
              void Taro.navigateTo({ url: '/pages/questionInfo/index' });
            }}
            className="text-right"
          >
            全部&gt;
          </View>
        )}
        {questionlist.length === 0 && (
          <Text className="mr-auto flex items-center justify-center">
            暂无内容敬请期待
          </Text>
        )}
      </View>
      <View>
        <View className="line-container pt-5 text-center text-xl">最新评论</View>
      </View>
      {comments &&
        comments.map((comment) => (
          <Comment
            onClick={(props) => {
              const serializedComment = encodeURIComponent(JSON.stringify(props));
              void Taro.navigateTo({
                url: `/pages/evaluateInfo/index?comment=${serializedComment}`,
              });
            }}
            key={comment.id}
            {...comment}
            type="inner"
          />
        ))}
    </View>
  );
}
