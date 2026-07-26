import Taro from '@tarojs/taro';

export const taroUserStorage = {
  getItem: (name: string) => {
    try {
      const raw = Taro.getStorageSync(name);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.error('[useUserStore] 读取缓存失败:', name, e);
      return null;
    }
  },
  setItem: (name: string, value: unknown) => {
    try {
      Taro.setStorageSync(name, JSON.stringify(value));
    } catch (e) {
      console.error('[useUserStore] 写入缓存失败:', name, e);
    }
  },
  removeItem: (name: string) => {
    try {
      Taro.removeStorageSync(name);
    } catch (e) {
      console.error('[useUserStore] 清除缓存失败:', name, e);
    }
  },
};
