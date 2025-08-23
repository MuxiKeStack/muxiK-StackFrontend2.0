/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useEffect, useState } from 'react';

import './label2.scss';

import Label3 from '../label3/label3';
import ShowStar from '../showStar/showStar';

export default function Label2(props) {
  const star2 = 'https://s2.loli.net/2023/08/29/rENVFz7xU9n2bd6.png';
  const star1 = 'https://s2.loli.net/2023/08/29/fB8wqj5mcQFiS7V.png';
  const star0 = 'https://s2.loli.net/2023/08/29/NRLD54kzG9nEOHW.png';

  const [starNum, setstarNum] = useState([star0, star0, star0, star0, star0]);

  const getStar = (num) => {
    const newStar = starNum.map(() => {
      const star = num >= 1 ? star2 : num > 0 ? star1 : star0;
      --num;
      return star;
    });
    setstarNum(newStar);
  };

  // 修正renderFeatures函数
  const renderFeatures = () => {
    // 检查props.features是否为数组，并且不为空
    const commentsArray =
      Array.isArray(props.features) && props.features.length > 0 ? props.features : [];

    // 返回map的结果
    return commentsArray.map((item, index) => {
      // 确保item存在并且有内容可以显示
      if (item) {
        const obj = { content: item };
        return <Label3 key={index} {...obj} />; // 添加key属性
      }
      return null;
    });
  };

  // 修正useEffect
  useEffect(() => {
    getStar(props.composite_score);
  }, [getStar, props.composite_score]); // 添加依赖项props.composite_score

  // ...其他代码

  return (
    <View
      className="label2"
      onTouchEnd={() => {
        void Taro.navigateTo({
          url: `/pages/classInfo/index?course_id=${props.id}`,
        });
      }}
    >
      <View className="labeltext1">{props.name}</View>
      <View className="labeltext2">{props.teacher}</View>
      <ShowStar score={props.composite_score} />
      <View className="comment">
        {renderFeatures()} {/* 直接渲染返回的元素数组 */}
      </View>
    </View>
  );
}
