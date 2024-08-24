import { StateCreator } from 'zustand';

import { get as fetchGet } from '@/api/get';

import { CourseInfoStore, PublisherDetailsType, PublisherInfoSlice } from './types';

export const CreatePublisherSlice: StateCreator<
  CourseInfoStore,
  [],
  [],
  PublisherInfoSlice
> = (set, get, api) => ({
  publishers: {},
  getPublishers(publisherId) {
    const local = get().publishers[publisherId];
    return local ? Promise.resolve(local) : get().fetchPublishers(publisherId);
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
