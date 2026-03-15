// AuthForm.tsx
import { signGradeSharing } from '@/common/api/grade';
import { userLogin } from '@/common/api/user';
import { Icon } from '@/common/assets/img/login';
import { LONG_TOKEN, SHORT_TOKEN, VISITOR } from '@/common/constants/auth';
import { STUDENT_ID, USER_INFO } from '@/common/constants/user';
import { Button, Image, Input, Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { memo, useCallback, useState } from 'react';

import { Popper } from '../index';
import './index.scss';

type UserData = {
  studentId: string;
  password: string;
  isAgreeTerms: boolean;
  userInfo: Taro.getUserProfile.SuccessCallbackResult['userInfo'] | null;
};

type LoginResponseHeaders = {
  'X-Jwt-Token'?: string;
  'X-Refresh-Token'?: string;
};

const AuthForm: React.FC = memo(() => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPopperOpened, setIsPopperOpened] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    studentId: '',
    password: '',
    isAgreeTerms: false,
    userInfo: null,
  });

  const handleAuthentication = useCallback(
    async (studentId: string, password: string) => {
      const res = await userLogin({ student_id: studentId, password });

      if (res.data.code !== 0) {
        throw new Error(res.data.msg || '登录失败');
      }

      const headers = res.header as LoginResponseHeaders;
      const shortToken = headers['X-Jwt-Token'];
      const longToken = headers['X-Refresh-Token'];

      if (!shortToken || !longToken) {
        throw new Error('登录失败：未获取到有效的 token');
      }

      Taro.setStorageSync(SHORT_TOKEN, shortToken.toString());
      Taro.setStorageSync(LONG_TOKEN, longToken.toString());
      Taro.setStorageSync(STUDENT_ID, studentId);

      return true;
    },
    []
  );

  const handleSignGradeSharing = useCallback(async () => {
    const res = await signGradeSharing({ wants_to_sign: true });

    if (res.code !== 0 && res.code !== 407001) {
      console.error('签约成绩共享失败:', res);
      throw new Error('登录失败');
    }

    return true;
  }, []);

  const handleGetUserProfile = useCallback(() => {
    return new Promise((resolve, reject) => {
      Taro.getUserProfile({
        desc: '用于完善用户资料',
        success: (res) => {
          setUserData((prev) => ({ ...prev, userInfo: res.userInfo }));
          Taro.setStorageSync(USER_INFO, res.userInfo);
          resolve(res.userInfo);
        },
        fail: (err) => {
          console.error('获取用户信息失败:', err);
          reject(new Error('获取用户信息失败'));
        },
      });
    });
  }, []);

  const handleLogin = useCallback(
    async (type: 'formal' | 'visitor') => {
      if (!userData.isAgreeTerms) {
        Taro.showToast({ icon: 'error', title: '请先同意隐私条例' });
        return;
      }

      if (type === 'formal' && (!userData.studentId || !userData.password)) {
        Taro.showToast({ icon: 'error', title: '请填写学号和密码' });
        return;
      }

      setIsLoading(true);
      Taro.showLoading({ title: '登录中...', mask: true });

      try {
        if (type === 'formal') {
          if (!userData.userInfo) {
            await handleGetUserProfile();
          }
          await handleAuthentication(userData.studentId, userData.password);

          await handleSignGradeSharing();
        } else {
          Taro.setStorageSync(SHORT_TOKEN, ' ');
          Taro.setStorageSync(LONG_TOKEN, ' ');
          Taro.setStorageSync(VISITOR, true);
        }

        Taro.switchTab({ url: '/pages/main/index' });
      } catch (error) {
        console.error(`${type}登录失败:`, error);
        Taro.showToast({
          icon: 'error',
          title: type === 'formal' ? '登录错误，请稍后重试' : '游客登录失败',
        });
      } finally {
        setIsLoading(false);
        Taro.hideLoading();
      }
    },
    [userData, handleAuthentication, handleSignGradeSharing, handleGetUserProfile]
  );

  const handleClosePopper = useCallback(() => {
    setIsPopperOpened(false);
  }, []);

  const handleInputChange = useCallback(
    (field: keyof UserData, value: string | boolean) => {
      setUserData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  return (
    <>
      <View className="authform_container">
        <View className="authform_logo_wrapper">
          <Image src={Icon as string} className="authform_logo" />
        </View>

        <View className="authform_form_container">
          <View className="authform_input_wrapper">
            <Input
              className="authform_input"
              placeholder="学号/昵称"
              value={userData.studentId}
              onInput={(e) => handleInputChange('studentId', e.detail.value)}
              disabled={isLoading}
            />

            <Input
              className="authform_input"
              placeholder="密码"
              value={userData.password}
              password
              onInput={(e) => handleInputChange('password', e.detail.value)}
              disabled={isLoading}
            />

            <Text className="authform_tip">请使用一站式账号密码登录</Text>
          </View>

          <View className="authform_btn_wrapper">
            <Button
              className={`authform_btn_primary ${isLoading ? 'authform_btn_disabled' : ''}`}
              onClick={() => handleLogin('formal')}
              disabled={isLoading}
              loading={isLoading}
            >
              <Text className="authform_btn_text">
                {isLoading ? '登录中...' : '学号登录'}
              </Text>
            </Button>

            <Text className="authform_btn_visitor" onClick={() => handleLogin('visitor')}>
              游客登录
            </Text>
          </View>
        </View>

        <View className="authform_agreement">
          <Button
            className={`authform_checkbox ${userData.isAgreeTerms ? 'authform_checkbox_active' : ''}`}
            onClick={() => handleInputChange('isAgreeTerms', !userData.isAgreeTerms)}
            disabled={isLoading}
          />

          <View className="authform_agreement_text">
            <Text className="authform_agreement_text_normal">我已同意</Text>
            <Text
              className="authform_agreement_text_link"
              onClick={() => setIsPopperOpened(true)}
            >
              《木犀课栈隐私条例》
            </Text>
            <Text className="authform_agreement_text_normal">内的所有内容</Text>
          </View>
        </View>
      </View>

      {isPopperOpened && <Popper onClose={handleClosePopper} />}
    </>
  );
});

export default AuthForm;
