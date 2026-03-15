import './index.scss';

import { View } from '@tarojs/components';
import React, { memo } from 'react';

import { NavigationBar } from '@/modules/navigation';

import { Header, List } from './component';

const Page: React.FC = memo(() => (
  <View className="flex h-screen w-full flex-col items-center">
    <NavigationBar title="个人主页" isTabPage />
    <Header />
    <List />
  </View>
));

export default Page;
