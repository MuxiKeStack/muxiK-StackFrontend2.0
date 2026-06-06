import { Text, View } from '@tarojs/components';
import React, { useMemo } from 'react';

import FeatureLabel from '@/common/components/FeatureLabel';
import ShowStar from '@/common/components/showStar/showStar';
import { ASSESSMENT_MAP, translateFeatures, translateCourseProperty } from '@/common/constants/courseLabels';
import type { Course } from '@/common/types/commentTypes';

import './index.scss';

interface Props {
  course: Course;
}

const CourseInfoSection: React.FC<Props> = React.memo(({ course }) => {
  const { school, teacher, composite_score, rater_count, type, features, assessments } = course;

  const featuresList = useMemo(
    () => translateFeatures(features),
    [features]
  );

  const assessmentsList = useMemo(() => {
    if (!assessments) return [];
    return Object.keys(assessments).map((k) => ASSESSMENT_MAP[k] || k);
  }, [assessments]);

  return (
    <>
      <View className="classInfo_page_teacher_info">
        {school}&nbsp;&nbsp;&nbsp;{teacher}
      </View>
      <View className="classInfo_page_info_row">
        综合评分: <ShowStar score={composite_score} />
        <Text className="classInfo_page_text">（共{rater_count}人评价）</Text>
      </View>
      <View className="classInfo_page_info_row">
        课程分类: <FeatureLabel checked content={translateCourseProperty(type)} />
      </View>
      <View className="classInfo_page_info_row">
        课程特点:{' '}
        {featuresList.length > 0 ? (
          featuresList.map((feature, key) => (
            <FeatureLabel checked key={key} content={feature} />
          ))
        ) : (
          <Text className="classInfo_page_placeholder">暂无课程特点</Text>
        )}
      </View>
      <View className="classInfo_page_info_row">
        考核方式:{' '}
        {assessmentsList.length > 0 ? (
          assessmentsList.map((item, key) => (
            <FeatureLabel checked key={key} content={item} />
          ))
        ) : (
          <Text className="classInfo_page_placeholder">暂无考核方式信息</Text>
        )}
      </View>
    </>
  );
});

export default CourseInfoSection;
