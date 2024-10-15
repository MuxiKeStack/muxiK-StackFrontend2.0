import Taro from '@tarojs/taro';
import React, { memo, useCallback } from 'react';
import { AtList, AtListItem } from 'taro-ui';

import {
  BookIcon,
  ClockIcon,
  MailIcon,
  StarIcon,
} from '@/common/assets/img/personalPage';
import { uniqueKey } from '@/common/utils';

const ListItems: { title: string; icon: string; url: string }[] = [
  { title: '我的课程', icon: BookIcon as string, url: '/pages/myclass/myclass' },
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

  return (
    <AtList className="relative bottom-[30vh] w-full px-[5%]">
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
