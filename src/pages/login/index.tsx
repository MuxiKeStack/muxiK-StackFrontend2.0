/* eslint-disable @typescript-eslint/ban-ts-comment */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/* eslint-disable no-console */
/* eslint-disable import/first */
import { Button, Checkbox, Image, Input, Text, View } from '@tarojs/components';
import Taro, { useLoad } from '@tarojs/taro';
import React, { useState } from 'react';

import './index.scss';

import handleLogin from '@/common/api/handleLogin';
import iconLogo from '@/common/assets/img/login/logo.png';
import top_background from '@/common/assets/img/login/top_background.png';
import { FloatingWindow } from '@/common/components';

type LoginProps = object;

const Login: React.FC<LoginProps> = () => {
  useLoad(() => {
    console.log('Page loaded.');
  });

  const [floatingWindowOpenning, setFloatingWindowOpenning] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const handleGetUserProfile = () => {
    void Taro.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        console.log('用户信息:', res.userInfo);

        // @ts-expect-error
        setUserInfo(res.userInfo);
        Taro.setStorageSync('userInfo', res.userInfo);
      },
      fail: (err) => {
        console.error('获取用户信息失败:', err);
      },
    });
  };

  const handleLoginClick = () => {
    if (agreeTerms) {
      if (!userInfo) {
        handleGetUserProfile();
      }
      void handleLogin({ student_id: studentId, password: password }).then((r) =>
        console.log(r)
      );
    } else {
      void Taro.showToast({
        icon: 'error',
        title: '请确认隐私条例',
      });
    }
  };

  return (
    <View className="login">
      <Image src={top_background} className="login_top_background"></Image>
      <View className="login_content">
        <Image src={iconLogo} className="logo"></Image>
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
              value={password}
              password
              onInput={(e) => setPassword(e.detail.value)}
            ></Input>
            <Text className="login_link">Forget your password?</Text>
          </View>
          <View className="login_main_button">
            <Button className="login_button" onClick={handleLoginClick}>
              学号登录
            </Button>
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
