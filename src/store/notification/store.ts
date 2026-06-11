import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { createTaroJSONStorage } from '@/common/utils/storage';
import { registerSessionReset } from '@/common/utils/resetSession';
import type { DataSource } from '@/common/types/loadType';

import { emptyNotificationData, type NotificationData } from './transforms';

interface NotificationStore {
  data: NotificationData;
  source: DataSource | null;
  loading: boolean;

  setLoading: (loading: boolean) => void;
  setData: (data: NotificationData) => void;
  commitLoadResult: (data: NotificationData, source: DataSource | null) => void;
  reset: () => void;
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set) => ({
      data: emptyNotificationData,
      source: null,
      loading: false,

      setLoading(loading) {
        set({ loading });
      },

      setData(data) {
        set({ data });
      },

      commitLoadResult(data, source) {
        set({ data, source });
      },

      reset() {
        set({ data: emptyNotificationData, source: null, loading: false });
      },
    }),
    {
      name: 'notification-store',
      storage: createTaroJSONStorage(),
      partialize: (state) => ({ data: state.data }),
    }
  )
);

registerSessionReset(() => useNotificationStore.getState().reset());
