import { View } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { memo } from 'react';

import './index.scss';

import { hasStoredSession } from '@/common/auth/session';

import { AuthForm } from './component';

const Login: React.FC = memo(() => {
  useDidShow(() => {
    if (hasStoredSession()) {
      void Taro.switchTab({ url: '/pages/main/index' });
    }
  });

  return (
    <View className="login_container">
      <View className="login_background"></View>
      <AuthForm />
    </View>
  );
});

export default Login;
