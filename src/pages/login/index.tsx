import { Button, Checkbox, Image, Input, Text, View } from '@tarojs/components';
import Taro, { useLoad } from '@tarojs/taro';
import { useState } from 'react';

import './index.scss';

import { FloatingWindow } from '@/components';

import { post } from '@/fetch';
import top_background from '@/img/login/top_background.png';

type LoginProps = object;

const Login: React.FC<LoginProps> = () => {
  useLoad(() => {
    console.log('Page loaded.');
  });

  const [floatingWindowOpenning, setFloatingWindowOpenning] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleLogin = () => {
    if (agreeTerms) {
      post('/user/login', {
        studentId: studentId,
        password: password,
      }).then((res) => {
        Taro.setStorage({ key: 'token', data: res.data.token });
        console.log('登录成功');
      });
    } else {
      console.log('请先确认隐私条例');
    }
  };

  return (
    <View className="login">
      <Image src={top_background} className="login_top_background"></Image>
      <View className="login_content">
        <View className="login_main">
          <View className="login_main_text">
            <Input
              className="login_input"
              placeholder="学号/昵称"
              value={studentId}
              onInput={(e) => setStudentId(e.detail.value)}
            ></Input>
            <Input
              className="login_input"
              placeholder="密码"
              /* @ts-ignore */
              type="password"
              value={password}
              onInput={(e) => setPassword(e.detail.value)}
            ></Input>
            <Text className="login_link">Forget your password?</Text>
          </View>
          <View className="login_main_button">
            <Button className="login_button" onClick={handleLogin}>
              学号登录
            </Button>
            <Button className="guest_button login_button">游客登录</Button>
          </View>
        </View>
        <View className="login_terms">
          <Checkbox
            value=""
            checked={agreeTerms}
            onClick={() => setAgreeTerms(!agreeTerms)}
            className="login_checkbox"
          ></Checkbox>
          <Text className="login_terms_text">我已同意</Text>
          <View
            className="floating_window_switch"
            onClick={() => setFloatingWindowOpenning(true)}
          >
            《木犀课栈隐私条例》
          </View>
          <Text className="login_terms_text">内的所有内容</Text>
        </View>
      </View>
      {floatingWindowOpenning && <FloatingWindow />}
    </View>
  );
};

export default Login;
