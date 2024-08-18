import { View } from '@tarojs/components';
import React from 'react';
import { AtRate } from 'taro-ui';

import './index.scss';

interface CollectionCourseProps {
  courseType?: string;
  courseName?: string;
  courseRate?: number;
  courseTeacher?: string;
  isCollected?: boolean;
}

const CollectionCourse: React.FC<CollectionCourseProps> = ({
                                                             courseType,
                                                             courseName,
                                                             courseRate,
                                                             courseTeacher,
                                                             isCollected,
                                                           }) => {
  if (!isCollected) {
    return null;
  }
  console.log(courseType);
  let courseIcon: string = '';
  // CoursePropertyGeneralCore = 通识核心课
  // CoursePropertyGeneralElective = 通识选修课
  // CoursePropertyGeneralRequired = 通识必修课
  // CoursePropertyMajorCore = 专业主干课程
  // CoursePropertyMajorElective = 个性发展课程
  switch (courseType) {
    case 'CoursePropertyGeneralCore':
      courseIcon = '通核';
      break;
    case 'CoursePropertyGeneralElective':
      courseIcon = '通选';
      break;
    case 'CoursePropertyGeneralRequired':
      courseIcon = '通必';
      break;
    case 'CoursePropertyMajorCore':
      courseIcon = '专';
      break;
    case 'CoursePropertyMajorElective':
      courseIcon = '个';
      break;
  }
  return (
    <View className="collection_course">
      <View className="collection_course_type">{courseIcon}</View>
      <View className="collection_course_detail">
        <View className="collection_course_name">{courseName}</View>
        <View className="collection_course_description">
          <View className="collection_course_teacher">{courseTeacher}</View>
          <AtRate className="collection_course_rate" value={courseRate} size={15} />
        </View>
      </View>
      {/*<View className="collection_course_collected">已收藏</View>*/}
    </View>
  );
};

export default CollectionCourse;
