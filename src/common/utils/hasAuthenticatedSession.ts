import Taro from '@tarojs/taro';

import { LONG_TOKEN } from '@/common/constants/auth';

// 当前是否有权拉取用户私有数据
export function hasAuthenticatedSession(): boolean {
  return !!Taro.getStorageSync(LONG_TOKEN);
}
