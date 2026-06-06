import Taro from '@tarojs/taro';

import { LONG_TOKEN, SHORT_TOKEN, VISITOR } from '@/common/constants/auth';
import { STUDENT_ID, USER_INFO } from '@/common/constants/user';
import { signGradeSharing } from '@/common/request/api/grade';
import { userLogin, userLogout } from '@/common/request/api/user';
import { BusinessError } from '@/common/request/errors/BusinessError';
import { useUserStore } from '@/store/useUserStore';

type LoginResponseHeaders = {
  'X-Jwt-Token'?: string;
  'X-Refresh-Token'?: string;
};

export const useAuthStore = {
  async loginFormal(studentId: string, password: string) {
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
    Taro.removeStorageSync(VISITOR);

    try {
      await signGradeSharing({ wants_to_sign: true });
    } catch (e) {
      if (!(e instanceof BusinessError && e.code === 407001)) {
        throw new Error('登录失败');
      }
    }

    await Promise.all([
      useUserStore.getState().ensureProfile(),
      useUserStore.getState().ensurePoints(),
    ]);
  },

  loginVisitor() {
    Taro.setStorageSync(SHORT_TOKEN, ' ');
    Taro.setStorageSync(LONG_TOKEN, ' ');
    Taro.setStorageSync(VISITOR, true);
  },

  saveUserInfo(userInfo: Taro.getUserProfile.SuccessCallbackResult['userInfo']) {
    Taro.setStorageSync(USER_INFO, userInfo);
  },

  async logout() {
    try {
      await userLogout();
    } catch {
      //
    }
  },
};
