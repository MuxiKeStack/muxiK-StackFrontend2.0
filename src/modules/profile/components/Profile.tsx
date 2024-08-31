import { View } from '@tarojs/components';
import React, { memo } from 'react';

import Header from './Header';
import List from './List';

const Profile: React.FC = memo(() => (
  <View className="flex flex-col items-center">
    <Header />
    <List />
  </View>
));

export default Profile;
