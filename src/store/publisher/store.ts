import { create } from 'zustand';

import { getUserProfile } from '@/common/request/api/user';
import type { PublisherDetailsType } from '@/common/types/courseType';

import type { PublisherStore } from './types';

const MAX_PUBLISHERS = 500;

const pendingRequests = new Map<number, Promise<PublisherDetailsType>>();

const DEFAULT_PUBLISHER: PublisherDetailsType = {
  id: 0,
  nickname: '未知用户',
  avatar: '',
};

export const usePublisherStore = create<PublisherStore>()((set, get) => ({
  publishers: {},

  cachePublishers(users) {
    if (!users.length) return;
    set((state) => {
      const next = { ...state.publishers };
      users.forEach((u) => {
        if (u.id) {
          next[u.id] = { ...(next[u.id] || {}), ...u };
        }
      });
      const keys = Object.keys(next);
      if (keys.length > MAX_PUBLISHERS) {
        delete next[Number(keys[0])];
      }
      return { publishers: next };
    });
  },

  fetchPublishers(publisherId) {
    if (!publisherId || publisherId <= 0) return Promise.resolve(DEFAULT_PUBLISHER);
    const cached = get().publishers[publisherId];
    if (cached) return Promise.resolve(cached);

    const pending = pendingRequests.get(publisherId);
    if (pending) return pending;

    const promise = getUserProfile(publisherId)
      .then((res: PublisherDetailsType) => {
        const data = res || DEFAULT_PUBLISHER;
        set((state) => {
          const next = { ...state.publishers, [publisherId]: data };
          const keys = Object.keys(next);
          if (keys.length > MAX_PUBLISHERS) {
            delete next[Number(keys[0])];
          }
          return { publishers: next };
        });
        return data;
      })
      .catch((e) => {
        console.error('[publisher] 获取发布者信息失败:', publisherId, e);
        const fallback = { ...DEFAULT_PUBLISHER, id: publisherId };
        set((state) => {
          const next = { ...state.publishers, [publisherId]: fallback };
          const keys = Object.keys(next);
          if (keys.length > MAX_PUBLISHERS) {
            delete next[Number(keys[0])];
          }
          return { publishers: next };
        });
        return fallback;
      })
      .finally(() => {
        pendingRequests.delete(publisherId);
      });

    pendingRequests.set(publisherId, promise);
    return promise;
  },

  async ensurePublishers(publisherIds) {
    const unique = [...new Set(publisherIds.filter((id) => id > 0))];
    if (!unique.length) return;
    const { publishers, fetchPublishers } = get();
    const toFetch = unique.filter((id) => !publishers[id]);
    await Promise.all(toFetch.map((id) => fetchPublishers(id)));
  },
}));
