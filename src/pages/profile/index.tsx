import './index.scss';

import { Button, Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import React, { memo, useEffect, useState } from 'react';

import { NavigationBar } from '@/modules/navigation';

import { Header, List } from './component';

const VISITOR_KEY = 'visitor';

const Page: React.FC = memo(() => {
  const [isVisitor, setIsVisitor] = useState(false);

  useEffect(() => {
    try {
      const visitor = Taro.getStorageSync(VISITOR_KEY);
      if (visitor) setIsVisitor(true);
    } catch {
      //
    }
  }, []);

  if (isVisitor) {
    return (
      <View className="flex h-screen w-full flex-col items-center">
        <NavigationBar title="个人主页" isTabPage />
        <View className="flex flex-1 flex-col items-center justify-center gap-6 px-8">
          <Text className="text-lg text-gray-500">游客模式暂不支持查看个人主页</Text>
          <Button
            className="rounded-full bg-[#FE9F00] px-8 py-2 text-white"
            onClick={() => {
              Taro.removeStorageSync(VISITOR_KEY);
              void Taro.reLaunch({ url: '/pages/login/index' });
            }}
          >
            去登录
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View className="flex h-screen w-full flex-col items-center">
      <NavigationBar title="个人主页" isTabPage />
      <Header />
      <List />
    </View>
  );
});

export default Page;
