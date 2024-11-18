import { Button, Checkbox, Image, Input, Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { memo, useCallback, useState } from 'react';

import handleLogin from '@/common/api/handleLogin';
import { Icon } from '@/common/assets/img/login';

import Popper from './Popper';

type UserData = {
  studentId: string;
  password: string;
  isAgreeTerms: boolean;
  userInfo: unknown;
};

const AuthForm: React.FC = memo(() => {
  const [isPopperOpened, setIsPopperOpened] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserData>({
    studentId: '',
    password: '',
    isAgreeTerms: false,
    userInfo: null,
  });

  const handleGetUserProfile = useCallback(() => {
    void Taro.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        setUserData({ ...userData, userInfo: res.userInfo });
        Taro.setStorageSync('userInfo', res.userInfo);
      },
      fail: (err) => {
        // eslint-disable-next-line no-console
        console.error('获取用户信息失败:', err);
      },
    });
  }, [userData]);

  const handleLoginClick = useCallback(() => {
    if (userData.isAgreeTerms) {
      if (!userData.userInfo) {
        handleGetUserProfile();
      }
      void handleLogin({
        student_id: userData.studentId,
        password: userData.password,
      });
    } else {
      void Taro.showToast({
        icon: 'error',
        title: '请确认隐私条例',
      });
    }
  }, [handleGetUserProfile, userData]);
  const handleLoginYouke = useCallback(() => {
    if (userData.isAgreeTerms) {
      void Taro.switchTab({
        url: '/pages/main/index',
      });
      void Taro.setStorage({
        key: 'shortToken',
        data: ' ',
      });

      void Taro.setStorage({
        key: 'longToken',
        data: ' ',
      });
    } else {
      void Taro.showToast({
        icon: 'error',
        title: '请确认隐私条例',
      });
    }
  }, [userData.isAgreeTerms]);
  const handleClosePopper = () => {
    setIsPopperOpened(false); // 关闭浮动窗口
  };
  return (
    <>
      <View className="absolute top-0 mt-[15vh] flex w-full flex-col items-center gap-4">
        <View className="h-40 w-40 overflow-hidden rounded-2xl shadow-xl">
          <Image src={Icon as string} className="h-full w-full"></Image>
        </View>
        <Text className="text-3xl font-semibold tracking-widest text-[#FFD777]">
          木犀课栈
        </Text>
        <View className="flex flex-col items-center">
          <View className="flex w-[80vw] flex-col items-center gap-3">
            <Input
              className="h-12 w-full rounded-l-full rounded-r-full bg-gray-100 px-5"
              placeholder="学号/昵称"
              value={userData.studentId}
              onInput={(e) => setUserData({ ...userData, studentId: e.detail.value })}
            ></Input>
            <Input
              className="h-12 w-full rounded-l-full rounded-r-full bg-gray-100 px-5"
              placeholder="密码"
              value={userData.password}
              password
              onInput={(e) => setUserData({ ...userData, password: e.detail.value })}
            ></Input>
            <Text className="text-sm text-gray-500">请使用一站式账号密码登录</Text>
          </View>
          <View className="mb-12 mt-8 flex w-[90vw] flex-col gap-2">
            <Button
              className="text-bold h-12 w-full rounded-l-full rounded-r-full border-none bg-[#ffd777] text-white"
              onClick={handleLoginClick}
            >
              学号登录
            </Button>
            <Button
              className="text-bold h-12 w-full rounded-l-full rounded-r-full border bg-[white] text-gray-500"
              onClick={handleLoginYouke}
            >
              游客登录
            </Button>
          </View>
        </View>
        <View className="flex items-center gap-2">
          <Checkbox
            className="-m-1"
            value=""
            checked={userData.isAgreeTerms}
            onClick={() =>
              setUserData({ ...userData, isAgreeTerms: !userData.isAgreeTerms })
            }
          ></Checkbox>
          <View className="flex w-full items-center">
            <Text className="text-sm">我已同意</Text>
            <View
              className="text-sm text-blue-500"
              onClick={() => setIsPopperOpened(true)}
            >
              《木犀课栈隐私条例》
            </View>
            <Text className="text-sm">内的所有内容</Text>
          </View>
        </View>
      </View>
      {isPopperOpened && <Popper onClose={handleClosePopper} />}
    </>
  );
});

export default AuthForm;
