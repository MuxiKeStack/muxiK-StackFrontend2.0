import { Image, Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import React, { memo, useCallback, useState } from 'react';
import { AtIcon, AtList, AtListItem } from 'taro-ui';

import { BookIcon, ClockIcon, MailIcon, StarIcon } from '@/common/assets/img/profile';
import { uniqueKey } from '@/common/utils';

const ListItems: { title: string; icon: string; url: string }[] = [
  { title: '我的课程', icon: BookIcon as string, url: '/pages/myclass/index' },
  { title: '我的收藏', icon: StarIcon as string, url: '/pages/myCollection/index' },
  {
    title: '评课历史',
    icon: ClockIcon as string,
    url: '/subpackages/profile/pages/history/index',
  },
  { title: '成绩共享计划', icon: MailIcon as string, url: '/pages/shareGrades/index' },
  { title: '意见反馈', icon: MailIcon as string, url: '/pages/feedback/index' },
];

const List: React.FC = memo(() => {
  const navigate = useCallback((url: string) => void Taro.navigateTo({ url }), []);
  const [test, setTest] = useState<boolean>(false);

  return !test ? (
    <View
      className="flex w-[95vw] flex-col items-center"
      style={{ borderTop: '1px solid rgba(237, 163, 53, 0.15)' }}
    >
      {ListItems.map((item) => (
        <View
          key={uniqueKey.nextKey()}
          className="flex h-16 w-full items-center justify-between"
          style={{ borderBottom: '1px solid rgba(237, 163, 53, 0.15)' }}
          onTouchEnd={() => navigate(item.url)}
        >
          <View className="flex items-center gap-3">
            <Image className="h-7 w-7" src={item.icon} />
            <Text className="text-lg">{item.title}</Text>
          </View>
          <AtIcon value="chevron-right" color="8C8C8C" />
        </View>
      ))}
    </View>
  ) : (
    <AtList className="w-[95vw] px-[10%]">
      {ListItems.map((item) => (
        <AtListItem
          key={uniqueKey.nextKey()}
          title={item.title}
          arrow="right"
          thumb={item.icon}
          onClick={() => navigate(item.url)}
        />
      ))}
    </AtList>
  );
});

export default List;
