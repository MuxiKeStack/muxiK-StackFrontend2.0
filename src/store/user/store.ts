import Taro from '@tarojs/taro';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { LONG_TOKEN } from '@/common/constants/auth';
import { getUserIntegral } from '@/common/request/api/integral';
import { editProfile, getProfile } from '@/common/request/api/user';

import { registerSessionReset } from '@/common/utils/resetSession';

import { taroUserStorage } from './storage';
import type { UserPoints, UserProfile, UserStore } from './types';

let pendingProfile: Promise<UserProfile | null> | null = null;
let pendingPoints: Promise<UserPoints | null> | null = null;

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      profile: null,
      points: null,
      profileSource: null,
      pointsSource: null,

      ensureProfile: async (options) => {
        if (!Taro.getStorageSync(LONG_TOKEN)) return null;

        const force = options?.force ?? false;
        const cached = get().profile;
        if (cached && !force) {
          set({ profileSource: 'cache' });
          return cached;
        }
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
        if (!Taro.getStorageSync(LONG_TOKEN)) return null;

        const force = options?.force ?? false;
        const cached = get().points;
        if (cached && !force) {
          set({ pointsSource: 'cache' });
          return cached;
        }
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
        const current = get().profile;
        if (current) {
          set({
            profile: {
              ...current,
              ...(body.nickname !== undefined && { nickname: body.nickname }),
              ...(body.avatar !== undefined && { avatar: body.avatar }),
              ...(body.using_title !== undefined && { using_title: body.using_title }),
            },
          });
        }
        void get()
          .ensureProfile({ force: true })
          .catch(() => {});
        return get().profile;
      },

      invalidateProfile: () => set({ profile: null }),
      invalidateAll: () => set({ profile: null, points: null }),

      reset: () => {
        pendingProfile = null;
        pendingPoints = null;
        set({
          profile: null,
          points: null,
          profileSource: null,
          pointsSource: null,
        });
      },
    }),
    {
      name: 'muxi-user-store',
      storage: taroUserStorage,
      partialize: (state) => ({ profile: state.profile, points: state.points }),
    }
  )
);

registerSessionReset(() => useUserStore.getState().reset());
