/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable import/first */
import { Text, View } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AtIcon } from 'taro-ui';

import './index.scss';

import { Comment } from '@/common/components';
import AnswerToStudent from '@/common/components/AnswerToStudent';
import LineChart from '@/common/components/chart';
import Label3 from '@/common/components/label3/label3';
import ShowStar from '@/common/components/showStar/showStar';
import { get, post } from '@/common/utils';
import { postBool } from '@/common/utils/fetch';

import { StatusResponse } from '../evaluate/evaluate';

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
  const [collect, setCollect] = useState<boolean | undefined>(course?.is_collected);
  const [test, setTest] = useState<boolean>(false);
  useEffect(() => {
    const getParams = async () => {
      try {
        const res = (await postBool('/checkStatus', {
          name: 'kestack',
        })) as StatusResponse;

        setTest(res.data.status);

        // const instance = Taro.getCurrentInstance();
        // const params = instance?.router?.params || {};

        // setId(params.id ? Number(params.id) : null);
        // setName(
        //   params.name ? decodeURIComponent(params.name) : '只能评价自己学过的课程哦'
        // );
      } catch (error) {
        console.error('Error fetching status:', error);
      }
    };

    void getParams();
  }, []);
  useEffect(() => {
    console.log('test status updated:', test);
  }, [test]);
  const getCommentData = async () => {
    try {
      await get(
        `/evaluations/list/courses/${courseId}?cur_evaluation_id=0&limit=100`
      ).then((res) => {
        setComments(res.data as CommentInfoType[]);
      });
    } catch (error) {
      console.error('Failed to fetch course data:', error);
    }
  };
  useEffect(() => {
    const getParams = () => {
      const instance = Taro.getCurrentInstance();
      const params = instance?.router?.params || {};

      if (params.course_id) setCourseId(params.course_id);
    };

    getParams();
  }, []);
  //获取问题个数
  const initData = () => {
    // eslint-disable-next-line @typescript-eslint/require-await
    const getCourseData = async () => {
      try {
        void get(`/courses/${courseId}/detail`).then((res) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          setCourse(res.data);
          !res.data && bailout();
        });
      } catch (error) {
        console.error('Failed to fetch course data:', error);
      }
    };

    if (courseId) void getCourseData();

    // eslint-disable-next-line @typescript-eslint/no-shadow
    const getCommentData = () => {
      try {
        void get(
          `/evaluations/list/courses/${courseId}?cur_evaluation_id=${0}&limit=${100}`
        ).then((res) => {
          console.log(res);
          setComments(res.data as CommentInfoType[]);
        });
      } catch (error) {
        console.error('Failed to fetch course data:', error);
      }
    };

    if (courseId) void getCommentData();
  };
  const fetchAnswer = () => {
    try {
      void get(
        `/questions/list?biz=Course&biz_id=${courseId}&cur_question_id=${0}&limit=${3}`
      ).then((res) => {
        console.log(res);

        console.log('questionlist1', res.data);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
        const questionsWithAnswers = res.data.map((item) => ({
          ...item,
          preview_answers: item.preview_answers || [],
        }));
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        setQuestionlist(res.data);
        Taro.hideLoading();
      });
    } catch (e) {
      console.error('Failed to fetch course data:', e);
    }
  };
  const fetchGrades = async () => {
    try {
      await get(`/grades/courses/${courseId}`).then((res) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        setGrade(res.data); // 设置 grade 数据
        !res.data && bailout();
        Taro.hideLoading();
      });
    } catch (err) {
      console.error('Failed to fetch grades data', err);
    }
  };
  const getNumData = () => {
    try {
      void get(`/questions/count?biz=Course&biz_id=${courseId}`).then((res) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        setQuestionNum(res.data);
        Taro.hideLoading();
      });
    } catch (e) {
      console.error(e);
    }
  };
  useEffect(() => {
    initData();
  }, [courseId]);
  useDidShow(() => {
    initData();
    if (courseId) {
      void Taro.showLoading({
        title: '加载中',
      });
      void fetchGrades();
      void getNumData();
      void fetchAnswer();
    }
  });
  useEffect(() => {
    if (courseId) {
      void Taro.showLoading({
        title: '加载中',
      });
      void fetchGrades();
      void getNumData();
      void fetchAnswer();
    }
  }, [courseId]);
  // 监听 collect 状态更新
  useEffect(() => {
    if (collect !== undefined) {
      console.log('Updated collect:', collect); // 打印最新的 collect 值
    }
  }, [collect]);
  function handleCollect() {
    void post(`/courses/${courseId}/collect`, { collect: !collect }).then((res) => {
      setCollect(!collect);
    });
  }
  const xLabels = useMemo(
    () => ['0-40', '40-50', '50-60', '60-70', '70-80', '80-90', '90-100'],
    []
  );
  const { heightLightPercent, yData } = useMemo(() => {
    const percent = (grade?.avg ?? 0) / 10;
    console.log(
      grade?.grades.map((item) => item.total_grades?.length ?? 0),
      grade?.grades
    );
    return {
      heightLightPercent: percent > 4 ? percent - 4 : 0,
      yData: grade?.grades.map((item) => item.total_grades?.length ?? 0),
    };
  }, [grade]);
  const bailout = useCallback(() => {
    void Taro.showToast({
      title: '请先确定已签约成绩共享计划',
      icon: 'none',
    });
    setTimeout(() => {
      void Taro.navigateBack();
    }, 1000);
  }, []);
  const featuresList = useMemo(() => {
    if (course?.features && Array.isArray(course?.features)) {
      return course?.features;
    }
    return [];
  }, [course?.features]);
  return (
    <View className="classInfo">
      <View className="theClassnme">{course?.name}</View>
      <View className="teacherName">
        {course?.school} {course?.teacher}
      </View>
      <View className="p">
        综合评分: <ShowStar score={course?.composite_score} />
        <Text>（共{course?.rater_count}人评价）</Text>
      </View>
      <View className="p">
        课程分类: <Label3 content={translateCourseProperty(course?.type)} />
      </View>
      <View className="p">
        课程特点: {}
        {featuresList.map((feature, keyindex) => (
          <Label3 key={keyindex} content={feature} />
        ))}
      </View>
      <LineChart
        className="mx-auto text-center"
        data={yData}
        xLabels={xLabels}
        heightLightPercent={heightLightPercent ?? 0}
        title={`平均分: ${grade?.avg?.toFixed(1) ?? 0}`}
      />
      <View>
        <View>
          <View className="line-container pt-2.5 text-center text-xl">
            问问同学({questionNum})
          </View>
        </View>
        <>
          {!test ? (
            <View>因为政策原因暂不能发布课评</View>
          ) : questionlist.length > 0 ? (
            <>
              <View className="relative">
                {questionlist.slice(0, 3).map((question, index) => (
                  <View key={question.id} style={{ filter: `blur(${index}px)` }}>
                    <AnswerToStudent
                      content={question.content}
                      preview_answers={question.preview_answers}
                    />
                  </View>
                ))}
              </View>
              <View
                className="text-center text-xl"
                onClick={() => {
                  void Taro.navigateTo({
                    url: `/pages/questionList/index?course_id=${courseId}`,
                  });
                }}
              >
                <Text>查看全部</Text>
              </View>
            </>
          ) : (
            <View
              className="flex h-[10vh] items-center justify-center"
              onClick={() => {
                void Taro.navigateTo({
                  url: `/pages/publishQuestion/index?course_id=${courseId}`,
                });
              }}
            >
              <Text className="text-center text-xl">暂无问题, 快去提问吧 》</Text>
            </View>
          )}
        </>
      </View>
      <View>
        <View className="line-container pt-5 text-center text-xl">最新评论</View>
      </View>
      {comments &&
        comments.map((comment) => (
          <Comment
            classNames="mt-2"
            showTag
            onClick={(props) => {
              const serializedComment = encodeURIComponent(JSON.stringify(props));
              void Taro.navigateTo({
                url: `/pages/evaluateInfo/index?comment=${serializedComment}`,
              });
            }}
            onLikeClick={() => void getCommentData()}
            key={comment.id}
            {...comment}
            type="inner"
          />
        ))}
      {comments.length === 0 && (
        <View
          className="flex h-[10vh] items-center justify-center"
          onClick={() => {
            void Taro.navigateTo({
              url: `pages/evaluate/evaluate?id=${courseId}&name=${course?.name}`,
            });
          }}
        >
          <Text className="text-center text-xl">暂无课评, 快去评价一下吧 》</Text>
        </View>
      )}
      <View
        className="fixed bottom-[12vh] right-8 flex flex-col items-center gap-2"
        onClick={handleCollect}
      >
        <View className="flex aspect-square w-14 items-center justify-center rounded-full bg-[#f9f9f2] shadow-xl">
          {collect ? (
            <AtIcon value="star-2" size={30} color="#f18900" />
          ) : (
            <AtIcon value="star" size={30} color="#f18900" />
          )}
        </View>
      </View>
    </View>
  );
}
