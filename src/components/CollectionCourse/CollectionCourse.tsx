import { View } from '@tarojs/components';
import React from 'react';
import { AtRate } from 'taro-ui';

import './index.scss';

interface CollectionCourseProps {
  courseType: string;
  courseName: string;
  courseRate: number;
  courseTeacher: string;
  isCollected: boolean;
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

  return (
    <View className="collection_course">
      <View className="collection_course_type">{courseType}</View>
      <View className="collection_course_detail">
        <View className="collection_course_name">{courseName}</View>
        <View className="collection_course_description">
          <View className="collection_course_teacher">{courseTeacher}</View>
          <AtRate className="collection_course_rate" value={courseRate} size={15} />
        </View>
      </View>
      <View className="collection_course_collected">已收藏</View>
    </View>
  );
};

export default CollectionCourse;
