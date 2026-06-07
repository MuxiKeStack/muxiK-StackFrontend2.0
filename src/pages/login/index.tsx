import { View } from '@tarojs/components';
import { memo } from 'react';

import './index.scss';

import { AuthForm } from './component';

const Login: React.FC = memo(() => (
  <View className="login_container">
    <View className="login_background"></View>
    <AuthForm />
  </View>
));

export default Login;
