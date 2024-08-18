// userService.ts
import { get } from '@/fetch'; // 确保这个路径正确
import { User } from './types';

export const getUserInfo = (userId: number): Promise<User> => {
  return get(`/users/${userId}/profile`).then((res) => {
    if (res.code === 0 && res.data) {
      return res.data;
    }
    throw new Error('User not found');
  });
};
