import { View } from '@tarojs/components';
import React, { memo } from 'react';

import { NavigationBar } from '@/modules/navigation';

import Header from './Header';
import List from './List';

const Profile: React.FC = memo(() => (
  <View className="flex h-screen w-full flex-col items-center gap-10">
    <NavigationBar title="个人主页" isTabPage />
    <Header />
    <List />
  </View>
));

export default Profile;
