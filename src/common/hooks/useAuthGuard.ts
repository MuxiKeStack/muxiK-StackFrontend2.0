import Taro from '@tarojs/taro';

import { VISITOR } from '@/common/constants/auth';

export function useAuthGuard() {
  const guard = (): boolean => {
    if (Taro.getStorageSync(VISITOR)) {
      Taro.showToast({ title: '请先登录', icon: 'none' });
      return false;
    }
    return true;
  };

  return { guard };
}
