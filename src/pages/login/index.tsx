import { View } from '@tarojs/components';
import { memo } from 'react';

import { AuthForm } from './component';
import './index.scss';

const Login: React.FC = memo(() => (
  <View className="login_container">
    <View className="login_background"></View>
    <AuthForm />
  </View>
));

export default Login;
