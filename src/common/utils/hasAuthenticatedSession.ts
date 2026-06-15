import Taro from '@tarojs/taro';

import { LONG_TOKEN } from '@/common/constants/auth';

export function hasAuthenticatedSession(): boolean {
  return !!Taro.getStorageSync(LONG_TOKEN);
}
