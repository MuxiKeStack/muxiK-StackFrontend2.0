import { View } from '@tarojs/components';
import { memo } from 'react';

import './style.scss';

import AuthForm from './AuthForm';

const Login: React.FC = memo(() => (
  <View className="h-screen w-full overflow-auto">
    <View className="background"></View>
    <AuthForm />
  </View>
));

export default Login;
