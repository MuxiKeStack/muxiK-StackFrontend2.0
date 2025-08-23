import { View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import React from 'react';
import { AtRate } from 'taro-ui';

import './index.scss';

interface CollectionCourseProps {
  courseType?: string;
  courseName?: string;
  courseRate?: number;
  courseTeacher?: string;
  isCollected?: boolean;
  courseId?: number;
}

const CollectionCourse: React.FC<CollectionCourseProps> = ({
  courseType,
  courseName,
  courseRate,
  courseTeacher,
  isCollected,
  courseId,
}) => {
  if (!isCollected) {
    return null;
  }
  const navigateToPage = async () => {
    await Taro.navigateTo({
      url: `/pages/classInfo/index?course_id=${courseId}`, // 传递 course_id 参数
    });
  };

  const handleClickToClass = () => {
    // console.log('Clicked on course:');
    void navigateToPage().then((r) => console.log(r)); // 这里调用异步函数，但不返回 Promise
  };
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
    <View className="collection_course" onTouchEnd={handleClickToClass}>
      <View className="collection_course_type">{courseIcon}</View>
      <View className="collection_course_detail">
        <View className="collection_course_name">{courseName}</View>
        <View className="collection_course_description">
          <View className="collection_course_teacher">{courseTeacher}</View>
          <AtRate className="collection_course_rate" value={courseRate} size={15} />
        </View>
      </View>
      <View className={`collection_course_collected ${isCollected ? 'active' : ''}`}>
        {isCollected ? '已收藏' : '未收藏'}
      </View>
    </View>
  );
};

export default CollectionCourse;
