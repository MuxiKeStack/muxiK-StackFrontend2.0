import { getFeeds } from '@/common/request/api/feed';
import { loadData } from '@/store/loadUtils';
import { useNotificationStore } from '@/store/notification';
import {
  emptyNotificationData,
  type NotificationData,
} from '@/store/notification/transforms';

import { buildNotificationMessages } from './buildMessages';

/** 编排：拉 feed + enrich + 写入 notification store */
export async function loadNotifications(): Promise<NotificationData> {
  const store = useNotificationStore.getState();
  store.setLoading(true);
  try {
    const result = await loadData({
      strategy: 'network-first',
      getCache: () => {
        const d = store.data;
        const hasData =
          d.commentMessage.length + d.supportMessage.length + d.officialMessage.length > 0;
        return hasData ? d : null;
      },
      fetch: async () => {
        const feeds = await getFeeds({
          last_time: 0,
          direction: 'After',
          limit: 15,
        });
        if (!Array.isArray(feeds)) return emptyNotificationData;
        return buildNotificationMessages(feeds);
      },
      setCache: (data) => store.setData(data),
    });
    store.commitLoadResult(result.data, result.source);
    return result.data;
  } finally {
    store.setLoading(false);
  }
}
