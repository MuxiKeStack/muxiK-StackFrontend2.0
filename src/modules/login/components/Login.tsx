import { Image, View } from '@tarojs/components';
import { memo } from 'react';

import { TopBackground } from '@/common/assets/img/login';

import AuthForm from './AuthForm';

const Login: React.FC = memo(() => (
  <View className="h-screen w-full overflow-auto">
    <Image src={TopBackground as string} className="w-full"></Image>
    <AuthForm />
  </View>
));

export default Login;
