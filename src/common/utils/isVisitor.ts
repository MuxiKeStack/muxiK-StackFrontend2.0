import Taro from '@tarojs/taro';

import { VISITOR } from '@/common/constants/auth';

export function isVisitorMode(): boolean {
  return !!Taro.getStorageSync(VISITOR);
}
