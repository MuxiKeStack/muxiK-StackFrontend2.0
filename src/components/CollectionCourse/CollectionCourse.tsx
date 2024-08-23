import { View } from '@tarojs/components';
import { useState } from 'react';
import { AtRate } from 'taro-ui';

import './index.scss';

type CollectionCourseProps = object;

const CollectionCourse: React.FC<CollectionCourseProps> = () => {
  const [courseType] = useState('专');
  const [courseName] = useState('高等数学A1');
  const [courseTeacher] = useState('周振荣');
  const [courseRate] = useState(3.5);
  const [isClollected] = useState(true);

  return (
    <>
      {isClollected && (
        <View className="collection_course">
          <View className="collection_course_type">{courseType}</View>
          <View className="collection_course_detail">
            <View className="collection_course_name">{courseName}</View>
            <View className="collection_course_description">
              <View className="collection_course_teacher">{courseTeacher}</View>
              <AtRate className="collection_course_rate" value={courseRate} size={15} />
            </View>
          </View>
          <View className="collection_course_clollected">已收藏</View>
        </View>
      )}
    </>
  );
};
export default CollectionCourse;
