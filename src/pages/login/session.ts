import Taro from '@tarojs/taro';

import { readResponseHeader } from '@/common/auth/session';
import { LONG_TOKEN, SHORT_TOKEN, VISITOR } from '@/common/constants/auth';
import { STUDENT_ID, USER_INFO } from '@/common/constants/user';
import { signGradeSharing } from '@/common/request/api/grade';
import { userLogin, userLogout } from '@/common/request/api/user';
import { BusinessError } from '@/common/request/errors/BusinessError';
import { resetSession } from '@/common/utils/resetSession';
import { useUserStore } from '@/store/user';

export async function loginFormal(studentId: string, password: string): Promise<void> {
  resetSession('login');

  const res = await userLogin({ student_id: studentId, password });

  if (res.data.code !== 0) {
    throw new Error(res.data.msg || '登录失败');
  }

  const headers = res.header as Record<string, unknown>;
  const shortToken = readResponseHeader(headers, 'x-jwt-token');
  const longToken = readResponseHeader(headers, 'x-refresh-token');

  if (!shortToken || !longToken) {
    throw new Error('登录失败：未获取到有效的 token');
  }

  Taro.setStorageSync(SHORT_TOKEN, shortToken.toString());
  Taro.setStorageSync(LONG_TOKEN, longToken.toString());
  Taro.setStorageSync(STUDENT_ID, studentId);

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
}

export function loginVisitor(): void {
  resetSession('visitor');
  Taro.setStorageSync(VISITOR, true);
}

export function saveUserInfo(
  userInfo: Taro.getUserProfile.SuccessCallbackResult['userInfo']
): void {
  Taro.setStorageSync(USER_INFO, userInfo);
}

export async function logout(): Promise<void> {
  try {
    await userLogout();
  } catch {
    //
  }
}
