import { Image, View } from '@tarojs/components';
import { memo } from 'react';

import TopBackground from '@/common/assets/img/login/top_background.png';

import AuthForm from './AuthForm';

const Login: React.FC = memo(() => (
  <View className="h-screen w-full">
    <Image
      src={TopBackground as string}
      className="relative left-[-3vh] top-[-13vh] h-[50vh] w-[120%]"
    ></Image>
    <AuthForm />
  </View>
));

export default Login;
