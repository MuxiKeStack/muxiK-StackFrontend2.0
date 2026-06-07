import { Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { ReactNode } from 'react';

import './index.scss';

import FeatureLabel from '../FeatureLabel';
import ShowStar from '../ShowStar';

export interface CourseLabelCourse {
  id: number | string;
  name: string;
  teacher: string;
  composite_score: number;
  features?: string[] | Record<string, number>;
  courseType?: string;
}

interface CourseLabelProps {
  course: CourseLabelCourse;
  starPlacement?: 'left' | 'right';
  FooterComponent?: ReactNode;
}

export default function CourseLabel({
  course,
  starPlacement,
  FooterComponent,
}: CourseLabelProps) {
  const { id, name, teacher, composite_score, features, courseType } = course;

  const renderFeatures = () => {
    const commentsArray = Array.isArray(features) && features.length > 0 ? features : [];

    return commentsArray.map((item, index) => {
      if (item) {
        return <FeatureLabel checked key={index} content={item} />;
      }
      return null;
    });
  };

  return (
    <View
      className="courseLabel"
      onClick={() => {
        void Taro.navigateTo({
          url: `/pages/classInfo/index?course_id=${id}`,
        });
      }}
    >
      <View className="class_header">
        <View className="class_info">
          <View className="class_name">{name}</View>
          <View className="class_teacher">{teacher}</View>
          {starPlacement === 'left' && (
            <View className="star_container">
              <ShowStar score={composite_score} />
            </View>
          )}
        </View>
        {(!starPlacement || starPlacement === 'right') && (
          <ShowStar score={composite_score} />
        )}
      </View>
      <View className="class_type_container">
        <Text className="class_type_text">{courseType}</Text>
      </View>
      {features && <View className="class_feature_container">{renderFeatures()}</View>}

      {FooterComponent && FooterComponent}
    </View>
  );
}
