import { View } from '@tarojs/components';
import React, { useEffect } from 'react';

import './index.scss';

import { useCourseStore } from '@/store/useCourseStore';

interface ICourseInfoProps {
  courseId: number;
}

const CourseInfo: React.FC<ICourseInfoProps> = ({ courseId }) => {
  const courseDetail = useCourseStore((s) => s.courseDetail[courseId]);

  useEffect(() => {
    if (!courseDetail && courseId > 0) {
      useCourseStore
        .getState()
        .fetchCourseDetail(courseId)
        .catch(() => {});
    }
  }, [courseId, courseDetail]);

  return (
    <View>
      <View className="theClassName">{courseDetail?.name || '加载中...'}</View>
      <View className="teacherName">
        {courseDetail?.school} {courseDetail?.teacher}
      </View>
    </View>
  );
};

export default CourseInfo;
