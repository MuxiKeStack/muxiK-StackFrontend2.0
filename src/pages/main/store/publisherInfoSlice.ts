import { StateCreator } from 'zustand';

import { get as fetchGet } from '@/common/api/get';

import { CourseInfoStore, PublisherDetailsType, PublisherInfoSlice } from './types';

export const CreatePublisherSlice: StateCreator<
  CourseInfoStore,
  [],
  [],
  PublisherInfoSlice
> = (set, get, api) => ({
  publishers: {},
  async getPublishers(publisherId) {
    let local = await Promise.resolve(get().publishers[publisherId]);
    if (!local?.avatar && publisherId) local = await get().fetchPublishers(publisherId);
    return local;
  },
  fetchPublishers(publisherId) {
    return fetchGet(`/users/${publisherId}/profile`).then(
      (res: { data: PublisherDetailsType }) => {
        set({ publishers: { ...get().publishers, [publisherId]: res.data } });
        return res.data;
      }
    );
  },
});
