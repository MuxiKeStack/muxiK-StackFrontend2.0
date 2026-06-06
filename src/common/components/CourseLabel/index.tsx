/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { ReactNode, useEffect, useState } from 'react';

import './index.scss';

import FeatureLabel from '../FeatureLabel';
import ShowStar from '../showStar/showStar';

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
  const star2 = 'https://s2.loli.net/2023/08/29/rENVFz7xU9n2bd6.png';
  const star1 = 'https://s2.loli.net/2023/08/29/fB8wqj5mcQFiS7V.png';
  const star0 = 'https://s2.loli.net/2023/08/29/NRLD54kzG9nEOHW.png';

  const [starNum, setstarNum] = useState([star0, star0, star0, star0, star0]);

  const getStar = (num: number) => {
    const newStar = starNum.map(() => {
      const star = num >= 1 ? star2 : num > 0 ? star1 : star0;
      --num;
      return star;
    });
    setstarNum(newStar);
  };

  // 修正renderFeatures函数
  const renderFeatures = () => {
    // 检查features是否为数组，并且不为空
    const commentsArray = Array.isArray(features) && features.length > 0 ? features : [];

    // 返回map的结果
    return commentsArray.map((item, index) => {
      // 确保item存在并且有内容可以显示
      if (item) {
        return <FeatureLabel checked key={index} content={item} />;
      }
      return null;
    });
  };

  // 修正useEffect
  useEffect(() => {
    getStar(composite_score);
  }, [getStar, composite_score]);

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
