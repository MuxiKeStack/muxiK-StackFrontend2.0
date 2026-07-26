import { Text, View } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import React, { memo, useRef } from 'react';
import { AtIcon } from 'taro-ui';

import './index.scss';

import { ActiveButtonType, useActiveButtonStore } from '@/store/app';

const TAB_LIST: Array<{
  pagePath: string;
  name: string;
  icon?: string;
  content?: string;
  matchPath?: string;
}> = [
  {
    pagePath: '/pages/main/index',
    name: 'Home',
    icon: 'streaming',
    content: '广场',
    matchPath: 'pages/main/index',
  },
  {
    pagePath: '/pages/guide/index',
    name: 'Guide',
    icon: 'download-cloud',
    content: '手册',
    matchPath: 'pages/guide/index',
  },
  { pagePath: '/pages/myclass/index', name: '+' },
  {
    pagePath: '/pages/notification/main/index',
    name: 'Message',
    icon: 'message',
    content: '消息',
    matchPath: 'pages/notification/main/index',
  },
  {
    pagePath: '/pages/profile/index',
    name: 'Profile',
    icon: 'user',
    content: '我的',
    matchPath: 'pages/profile/index',
  },
];

const TabBar: React.FC = memo(() => {
  const { activeButton, setActiveButton } = useActiveButtonStore();
  const lastClickTime = useRef(0);

  useDidShow(() => {
    // 自定义 tabBar 里 getCurrentInstance().router 不可靠，改用页面栈读当前页，
    // 保证重登后回到广场时高亮能正确归位
    const pages = Taro.getCurrentPages();
    const currentPage = pages[pages.length - 1]?.route || '';
    const matched = TAB_LIST.find(
      (item) => item.matchPath && currentPage.includes(item.matchPath)
    );
    if (matched?.name && matched.name !== '+') {
      setActiveButton(matched.name as ActiveButtonType);
    }
  });

  const handleTabClick = (item: (typeof TAB_LIST)[number]) => {
    const now = Date.now();
    if (now - lastClickTime.current < 300) return;
    lastClickTime.current = now;

    if (item.name === '+') {
      void Taro.navigateTo({ url: '/pages/myclass/index' });
    } else {
      setActiveButton(item.name as ActiveButtonType);
      void Taro.switchTab({ url: item.pagePath });
    }
  };

  return (
    <View className="guild_line">
      {TAB_LIST.map((item) => (
        <View key={item.name}>
          {item.name === '+' ? (
            <View
              className="add_button"
              onClick={() => {
                handleTabClick(item);
              }}
            ></View>
          ) : (
            <View
              className="tab-item-wrapper"
              onClick={() => {
                handleTabClick(item);
              }}
            >
              <AtIcon
                value={item.icon as string}
                size="30"
                color={activeButton === item.name ? '#f18900' : '#999999'}
              />
              <Text className={`tab-text ${activeButton === item.name ? 'active' : ''}`}>
                {item.content}
              </Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );
});

export default TabBar;
