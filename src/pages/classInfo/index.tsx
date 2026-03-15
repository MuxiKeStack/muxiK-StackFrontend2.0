/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Icon, TopBackground } from '@/common/assets/img/login';
import { CourseReview, Drawer } from '@/common/components';
import LineChart from '@/common/components/chart';
import FeatureLabel from '@/common/components/FeatureLabel';
import ShowStar from '@/common/components/showStar/showStar';
import { get, post } from '@/common/utils';
import { postBool } from '@/common/utils/fetch';
import { NavigationBar } from '@/modules/navigation';
import { Image, ScrollView, Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AtIcon } from 'taro-ui';
import QAlist from './component/QAlist';
import './index.scss';
import { mockQuestionList, mockQuestionNum } from './mock';

import { StatusResponse } from '../evaluate';

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

const Page: React.FC = () => {
  const [drawerOpened, setDrawerOpened] = useState(false);
  const [course, setCourse] = useState<Course | null>(null);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [comments, setComments] = useState<CommentInfoType[]>([]);
  const [grade, setGrade] = useState<GradeChart>();
  const [questionNum, setQuestionNum] = useState<number>(mockQuestionNum);
  const [questionlist, setQuestionlist] = useState<WebQuestionVo[]>(mockQuestionList);
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
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          setCollect(res.data.is_collected);
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
  // const fetchAnswer = async () => {
  //   try {
  //     const res = await get(
  //       `/questions/list?biz=Course&biz_id=${courseId}&cur_question_id=${0}&limit=${3}`
  //     );
  //     // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  //     setQuestionlist(res.data);
  //   } catch (e) {
  //     console.error('Failed to fetch course data:', e);
  //     throw e;
  //   }
  // };
  const fetchGrades = async () => {
    try {
      const res = await get(`/grades/courses/${courseId}`);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      setGrade(res.data);
      if (!res.data) {
        bailout();
        return;
      }
    } catch (err) {
      console.error('Failed to fetch grades data', err);
      throw err;
    }
  };
  // const getNumData = () => {
  //   try {
  //     void get(`/questions/count?biz=Course&biz_id=${courseId}`).then((res) => {
  //       // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  //       setQuestionNum(res.data);
  //       Taro.hideLoading();
  //     });
  //   } catch (e) {
  //     console.error(e);
  //   }
  // };
  useEffect(() => {
    initData();
  }, [courseId]);
  useEffect(() => {
    const fetchData = async () => {
      if (!courseId) return;

      try {
        void Taro.showLoading({
          title: '加载中',
        });

        // 并行请求数据
        await Promise.all([fetchGrades()]);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        void Taro.showToast({
          title: '加载失败',
          icon: 'error',
        });
      } finally {
        void Taro.hideLoading();
      }
    };

    void fetchData();
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
  const xLabels = useMemo(() => ['0', '60', '70', '80', '90', '100'], []);
  const { yData, max, min, avg } = useMemo(() => {
    const percent = (grade?.avg ?? 0) / 10;
    const customData: number[] = [];
    let maxS = -1,
      minS = Infinity;
    if (grade)
      grade.grades.map((item) => {
        if (item.total_grades) {
          customData.push(...item.total_grades);
          maxS = Math.max(Math.max(...[...item.total_grades]), maxS);
          minS = Math.min(Math.min(...[...item.total_grades]), minS);
        }
      });
    return {
      yData: customData,
      max: maxS,
      min: minS,
      avg: grade?.avg ?? -1,
    };
  }, [grade]);
  const bailout = useCallback(() => {
    void Taro.showToast({
      title: '加载课程信息失败，请稍后重试',
      icon: 'none',
    });
    setTimeout(() => {
      void Taro.switchTab({
        url: '/pages/main/index',
      });
    }, 2000);
  }, []);
  const featuresList = useMemo(() => {
    if (course?.features && Array.isArray(course?.features)) {
      return course?.features;
    }
    return [];
  }, [course?.features]);
  return !test ? (
    <View className="classInfo_page_unauthorized_container">
      <Image
        src={TopBackground as string}
        className="classInfo_page_background_image"
      ></Image>
      <View className="classInfo_page_unauthorized_content">
        <View className="classInfo_page_unauthorized_icon_wrapper">
          <Image
            src={Icon as string}
            className="classInfo_page_unauthorized_icon"
          ></Image>
        </View>
        <Text className="classInfo_page_unauthorized_text">木犀课栈</Text>
      </View>
    </View>
  ) : (
    <View className="classInfo_page_container">
      <NavigationBar title="课程主页" isBackToPage />
      <View className="classInfo_page_header_container">
        <View className="classInfo_page_course_name">{course?.name}</View>
        <View className="classInfo_page_collect_icon_wrapper" onClick={handleCollect}>
          {collect ? (
            <AtIcon value="star-2" size={25} color="#FE9F00" />
          ) : (
            <AtIcon value="star" size={25} color="#FE9F00" />
          )}
        </View>
      </View>
      <View className="classInfo_page_teacher_info">
        {course?.school}&nbsp;&nbsp;&nbsp;{course?.teacher}
      </View>
      <View className="classInfo_page_info_row">
        综合评分: <ShowStar score={course?.composite_score} />
        <Text className="classInfo_page_text">（共{course?.rater_count}人评价）</Text>
      </View>
      <View className="classInfo_page_info_row">
        课程分类: <FeatureLabel checked content={translateCourseProperty(course?.type)} />
      </View>
      <View className="classInfo_page_info_row">
        课程特点:
        {featuresList && featuresList.length > 0 ? (
          featuresList.map((feature, keyindex) => (
            <FeatureLabel checked key={keyindex} content={feature} />
          ))
        ) : (
          <Text className="classInfo_page_placeholder">暂无课程特点</Text>
        )}
      </View>
      <View className="classInfo_page_info_row">
        {/* todos: 新增的，后端没传吗？记得加，占个位先*/}
        考核方式:
        {featuresList && featuresList.length > 0 ? (
          featuresList.map((feature, keyindex) => (
            <FeatureLabel checked key={keyindex} content={feature} />
          ))
        ) : (
          <Text className="classInfo_page_placeholder">暂无考核方式信息</Text>
        )}
      </View>
      <View className="classInfo_page_grade_title">成绩分布</View>
      <View className="classInfo_page_chart_container">
        <LineChart
          data={yData}
          xLabels={xLabels}
          maxScore={max}
          minScore={min}
          avgScore={avg}
          title={`平均分: ${grade?.avg?.toFixed(1) ?? 0}`}
        />
      </View>
      <View className="classInfo_page_questions_section">
        <View className="classInfo_page_questions_title">问问同学</View>
        <View className="classInfo_page_questions_header">
          <Text className="classInfo_page_questions_header_title">有问题，问大家</Text>
          <Text
            className="classInfo_page_questions_header_more"
            onClick={() => {
              setDrawerOpened(true);
            }}
          >
            查看更多
          </Text>
        </View>

        {questionlist.length > 0 ? (
          <>
            {questionlist.slice(0, 2).map((question) => (
              <View key={question.id} className="classInfo_page_question_item">
                <View className="classInfo_page_question_title_row">
                  <Text className="classInfo_page_question_mark">问</Text>
                  <Text className="classInfo_page_question_title">
                    {question.content}
                  </Text>
                  <Text className="classInfo_page_question_count">
                    ({question.answer_cnt || 0}条)
                  </Text>
                </View>

                <View className="classInfo_page_answer_preview">
                  {question.preview_answers && question.preview_answers.length > 0 ? (
                    question.preview_answers.slice(0, 2).map((answer, idx) => (
                      <View key={idx} className="classInfo_page_answer_item">
                        <Text className="classInfo_page_answer_content">
                          {answer.content}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <Text className="classInfo_page_answer_placeholder">
                      暂无回答，快来抢沙发
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </>
        ) : (
          <View
            className="classInfo_page_empty_questions"
            onClick={() => {
              void Taro.navigateTo({
                url: `/pages/publishQuestion/index?course_id=${courseId}`,
              });
            }}
          >
            <Text className="classInfo_page_empty_text">暂无问题，快去提问吧 》</Text>
          </View>
        )}
      </View>
      <View className="classInfo_page_comments_section">
        <View className="classInfo_page_comments_title">评论区</View>
        <ScrollView className="classInfo_page_comments_scroll" scrollY>
          <View className="classInfo_page_comments_list">
            {comments &&
              comments.map((comment) => (
                <CourseReview
                  classNames="classInfo_page_comment_item"
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
          </View>
        </ScrollView>
        {comments.length === 0 && (
          <View
            className="classInfo_page_empty_comments"
            onClick={() => {
              void Taro.navigateTo({
                url: `pages/evaluate/index?id=${courseId}&name=${course?.name}`,
              });
            }}
          >
            <Text className="classInfo_page_empty_questions_text">
              暂无课评, 快去评价一下吧 》
            </Text>
          </View>
        )}
      </View>
      <Drawer
        isOpened={drawerOpened}
        onClose={() => setDrawerOpened(false)}
        title="问问同学"
      >
        <QAlist qas={questionlist}></QAlist>
      </Drawer>
    </View>
  );
};

export default Page;
