/* eslint-disable no-console */
import { View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import './index.scss';

import {
  loadClassInfo,
  subscribeClassInfoEvents,
  toggleClassCollect,
  useClassInfo,
} from '@/pages/classInfo/model';

import { Drawer, GateScreen, LineChart } from '@/common/components';
import { ROUTES } from '@/common/constants/routes';
import { useAuthGuard } from '@/common/hooks/useAuthGuard';
import { useGateGuard } from '@/common/hooks/useGateGuard';
import type { CommentInfo } from '@/common/types/commentTypes';
import type { WebQuestionVo } from '@/common/types/userTypes';
import { navigateToEvaluationDetail } from '@/common/utils/evaluation';
import { NavigationBar } from '@/modules/navigation';

import CommentsSection from './component/CommentsSection';
import CourseHeaderSection from './component/CourseHeaderSection';
import CourseInfoSection from './component/CourseInfoSection';
import QAlist from './component/QAlist';
import QuestionsSection from './component/QuestionsSection';

const Page: React.FC = () => {
  const [drawerOpened, setDrawerOpened] = useState(false);
  const [courseId, setCourseId] = useState<string | null>(null);
  const { course, comments, grade, questionlist, collect } = useClassInfo();

  const gate = useGateGuard();
  const { guard } = useAuthGuard();
  const bailoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const instance = Taro.getCurrentInstance();
    const params = instance?.router?.params || {};
    if (params.course_id) setCourseId(params.course_id);
  }, []);

  const bailout = useCallback(() => {
    void Taro.showToast({ title: '加载课程信息失败，请稍后重试', icon: 'none' });
    if (bailoutTimerRef.current) clearTimeout(bailoutTimerRef.current);

    bailoutTimerRef.current = setTimeout(() => {
      void Taro.switchTab({ url: '/pages/main/index' });
    }, 2000);
  }, []);

  useEffect(() => {
    if (!courseId) return;
    void Taro.showLoading({ title: '加载中' });

    void loadClassInfo(Number(courseId))
      .then((data) => {
        if (!data.course) bailout();
      })
      .catch((err) => {
        console.error(err);
        void Taro.showToast({ title: '加载失败', icon: 'error' });
      })
      .finally(() => {
        void Taro.hideLoading();
      });
  }, [courseId, bailout]);

  const handleCollect = useCallback(async () => {
    if (!courseId || !course) return;
    if (!guard()) return;

    try {
      const nextCollect = await toggleClassCollect(Number(courseId), course, !!collect);
      const titleText = nextCollect ? '收藏成功' : '取消收藏成功';
      void Taro.showToast({ title: titleText, icon: 'success' });
    } catch (err) {
      console.error(err);
      void Taro.showToast({ title: '操作失败', icon: 'error' });
    }
  }, [courseId, course, collect, guard]);

  const gradeData = useMemo(() => {
    const customData: number[] = [];
    let maxS = -1,
      minS = Infinity;
    if (grade)
      grade.grades.forEach((item) => {
        if (item.total_grades) {
          customData.push(...item.total_grades);
          maxS = Math.max(...item.total_grades, maxS);
          minS = Math.min(...item.total_grades, minS);
        }
      });
    return {
      data: customData,
      xLabels: ['0', '60', '70', '80', '90', '100'] as string[],
      maxScore: maxS,
      minScore: minS,
      avgScore: grade?.avg ?? -1,
    };
  }, [grade]);

  useEffect(() => {
    if (!courseId) return;
    const id = Number(courseId);

    return subscribeClassInfoEvents(id);
  }, [courseId]);

  useEffect(() => {
    return () => {
      if (bailoutTimerRef.current) clearTimeout(bailoutTimerRef.current);
    };
  }, []);

  const handleDrawerOpen = useCallback(() => setDrawerOpened(true), []);
  const handleDrawerClose = useCallback(() => setDrawerOpened(false), []);

  const handleCommentClick = useCallback((props: CommentInfo) => {
    navigateToEvaluationDetail(props);
  }, []);

  const handleQuestionClick = useCallback(
    (question: WebQuestionVo) => {
      void Taro.navigateTo({
        url: `${ROUTES.course.questionInfo}?id=${question.id}&course_id=${courseId}`,
      });
    },
    [courseId]
  );

  const handleEmptyQuestionClick = useCallback(() => {
    if (!guard()) return;
    void Taro.navigateTo({
      url: `${ROUTES.course.publishQuestion}?course_id=${courseId}`,
    });
  }, [courseId, guard]);

  const handleEmptyCommentClick = useCallback(() => {
    if (!guard()) return;
    void Taro.navigateTo({
      url: `${ROUTES.course.evaluate}?id=${courseId}&name=${course?.name}`,
    });
  }, [courseId, course?.name, guard]);

  if (gate === 'loading') return null;
  if (gate === 'block') {
    return <GateScreen />;
  }

  return (
    <View className="classInfo_page_container">
      <NavigationBar title="课程主页" isBackToPage />
      <CourseHeaderSection
        name={course?.name}
        collect={collect}
        onCollect={handleCollect}
      />
      {course && <CourseInfoSection course={course} />}
      <View className="classInfo_page_grade_title">成绩分布</View>
      {!drawerOpened && (
        <View className="classInfo_page_chart_container">
          <LineChart
            gradeData={gradeData}
            title={`平均分: ${grade?.avg?.toFixed(1) ?? 0}`}
          />
        </View>
      )}
      <QuestionsSection
        questionlist={questionlist}
        onMoreClick={handleDrawerOpen}
        onEmptyClick={handleEmptyQuestionClick}
        onQuestionClick={handleQuestionClick}
      />
      <CommentsSection
        comments={comments}
        onCommentClick={handleCommentClick}
        onEmptyClick={handleEmptyCommentClick}
      />
      <Drawer isOpened={drawerOpened} onClose={handleDrawerClose} title="问问同学">
        <QAlist
          qas={questionlist}
          courseId={courseId}
          onQuestionClick={handleQuestionClick}
        />
      </Drawer>
    </View>
  );
};

export default Page;
