import { Image, Input, Text, View } from '@tarojs/components';
import { useLoad } from '@tarojs/taro';
import { useState } from 'react';

import './research.scss';

import Label2 from '@/components/label2/label2';

import Label1 from '../../components/label1/label1';

export default function Research() {
  const [hrs, sethrs] = useState([
    { content: '高等数学A1' },
    { content: '中国近现代史纲要' },
    { content: '世界性民间文学经典赏析' },
    { content: '英美文学名篇赏析' },
  ]);

  const [isSpread, setSpread] = useState(true);

  const [classes, setclasses] = useState([
    {
      name: '高等数学A1',
      teacher: '周振荣',
      score: 3.5,
      comments: ['老师幽默风趣', '评分高', '作业少'],
    },
    {
      name: '世界性民间文学经典赏析',
      teacher: '张静',
      score: 3.5,
      comments: ['老师幽默风趣', '评分高', '作业少'],
    },
  ]);

  useLoad(() => {
    console.log('Page loaded.');
  });

  const handleClick = () => {
    setSpread(false);
  };

  const handleBlur = () => {
    setSpread(true);
  };

  return (
    <View className="index">
      <View>
        <Input
          onBlur={handleBlur}
          onClick={handleClick}
          className="searchInput"
          type="text"
          placeholder="搜索课程名/老师名"
          placeholderStyle="color:#9F9F9C"
        />
        <Image
          style="width: 34.09rpx;height:34.09rpx;"
          className="search"
          src="https://s2.loli.net/2023/08/26/UZrMxiKnlyFOmuX.png"
        ></Image>
      </View>
      {isSpread ? (
        <View className="tj">
          {classes.map((each) => {
            return <Label2 {...each} />;
          })}
        </View>
      ) : (
        <View>
          <Text className="lsss">历史搜索</Text>
          <View className="button">
            <Image
              style="width:29.37rpx;height:30.83rpx;"
              src="https://s2.loli.net/2023/08/26/3XBEGlN2UuJdejv.png"
            />
          </View>
          <View className="historyResult">
            {hrs.map((hr) => {
              return <Label1 {...hr} />;
            })}
          </View>
        </View>
      )}
    </View>
  );
}
