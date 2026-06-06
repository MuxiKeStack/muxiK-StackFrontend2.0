import Taro from '@tarojs/taro';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { LONG_TOKEN } from '@/common/constants/auth';
import { getUserIntegral } from '@/common/request/api/integral';
import { editProfile, getProfile } from '@/common/request/api/user';

import type { DataSource } from './types';

interface UserProfile {
  nickname: string;
  avatar: string;
  using_title: string;
  title_ownership: Record<string, boolean>;
  new: boolean;
  studentId: string;
}

interface UserPoints {
  level: number;
  points: number;
  next_level_points: number;
}

interface UserStore {
  profile: UserProfile | null;
  points: UserPoints | null;
  profileSource: DataSource | null;
  pointsSource: DataSource | null;
  ensureProfile: (options?: { force?: boolean }) => Promise<UserProfile | null>;
  ensurePoints: (options?: { force?: boolean }) => Promise<UserPoints | null>;
  updateProfile: (body: {
    nickname?: string;
    avatar?: string;
    using_title?: string;
  }) => Promise<UserProfile | null>;
  invalidateProfile: () => void;
  invalidateAll: () => void;
}

let pendingProfile: Promise<UserProfile | null> | null = null;
let pendingPoints: Promise<UserPoints | null> | null = null;

const taroStorage = {
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

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      profile: null,
      points: null,
      profileSource: null,
      pointsSource: null,

      ensureProfile: async (options) => {
        const force = options?.force ?? false;
        const cached = get().profile;
        if (cached && !force) {
          set({ profileSource: 'cache' });
          return cached;
        }

        if (!Taro.getStorageSync(LONG_TOKEN)) return null;
        if (pendingProfile) return pendingProfile;

        pendingProfile = getProfile()
          .then((data) => {
            if (data) {
              set({ profile: data as UserProfile, profileSource: 'network' });
              return data as UserProfile;
            }
            return null;
          })
          .catch((e) => {
            console.error('[useUserStore] 请求失败:', e);
            return null;
          })
          .finally(() => {
            pendingProfile = null;
          });

        return pendingProfile;
      },

      ensurePoints: async (options) => {
        const force = options?.force ?? false;
        const cached = get().points;
        if (cached && !force) {
          set({ pointsSource: 'cache' });
          return cached;
        }
        if (!Taro.getStorageSync(LONG_TOKEN)) return null;
        if (pendingPoints) return pendingPoints;

        pendingPoints = getUserIntegral()
          .then((data) => {
            if (data) {
              set({ points: data as UserPoints, pointsSource: 'network' });
              return data as UserPoints;
            }
            return null;
          })
          .catch((e) => {
            console.error('[useUserStore] 请求失败:', e);
            return null;
          })
          .finally(() => {
            pendingPoints = null;
          });

        return pendingPoints;
      },

      async updateProfile(body) {
        await editProfile(body);
        set({ profile: null });
        return get().ensureProfile({ force: true });
      },

      invalidateProfile: () => set({ profile: null }),
      invalidateAll: () => set({ profile: null, points: null }),
    }),
    {
      name: 'muxi-user-store',
      storage: taroStorage,
      partialize: (state) => ({ profile: state.profile, points: state.points }),
    }
  )
);
