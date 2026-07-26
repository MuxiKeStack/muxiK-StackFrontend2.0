import Taro from '@tarojs/taro';
import { createJSONStorage, type StateStorage } from 'zustand/middleware';

export const taroStorageAdapter: StateStorage = {
  getItem: (name: string) =>
    Taro.getStorage({ key: name })
      .then((res) => (res.data as string) ?? null)
      .catch(() => null),
  setItem: (name: string, value: string) =>
    Taro.setStorage({ key: name, data: value }).then(() => undefined),
  removeItem: (name: string) => Taro.removeStorage({ key: name }).then(() => undefined),
};

export const createTaroJSONStorage = () => createJSONStorage(() => taroStorageAdapter);
