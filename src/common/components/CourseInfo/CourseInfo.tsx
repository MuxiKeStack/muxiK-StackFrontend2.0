import { View } from '@tarojs/components';
import React from 'react';
import './index.scss';

interface ICourseInfoProps {
  name?: string;
  school?: string;
  teacher?: string;
}

const CourseInfo: React.FC<ICourseInfoProps> = ({ name, school, teacher }) => {
  return (
    <View>
      <View className="theClassName">{name}</View>
      <View className="teacherName">
        {school} {teacher}
      </View>
    </View>
  );
};

export default CourseInfo;
