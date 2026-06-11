import Taro from '@tarojs/taro';

import { ROUTES } from '@/common/constants/routes';
import { getFeeds } from '@/common/request/api/feed';
import { navigateToEvaluationDetailById } from '@/common/utils/evaluation';
import { hasAuthenticatedSession } from '@/common/utils/hasAuthenticatedSession';
import { isVisitorMode } from '@/common/utils/isVisitor';
import { loadData } from '@/common/utils/loadData';
import { useEvaluationStore } from '@/store/evaluations';
import { useNotificationStore } from '@/store/notification';
import {
  buildMessages,
  emptyNotificationData,
  type NotificationData,
} from '@/store/notification/transforms';

import type { MessageItemProps } from './type';

export function getNotificationUrl(message: MessageItemProps): string | null {
  const { biz, bizId, type } = message;
  if (type === 'official' || !biz) return null;

  if (biz === 'Evaluation') {
    const params = [`bizId=${bizId || ''}`].filter(Boolean).join('&');
    return `${ROUTES.course.evaluateInfo}?${params}`;
  }

  if (biz === 'Answer') {
    const params = [`answerId=${bizId || ''}`].filter(Boolean).join('&');
    return `${ROUTES.course.questionInfo}?${params}`;
  }

  return null;
}

/** 主包通知页跳转：只 navigateTo 路径字符串，不 import 分包模块 */
export function openNotificationTarget(message: MessageItemProps): void {
  const { biz, bizId, type } = message;
  if (type === 'official' || !biz) return;

  if (biz === 'Evaluation') {
    navigateToEvaluationDetailById(bizId || '');
    return;
  }

  const url = getNotificationUrl(message);
  if (url) void Taro.navigateTo({ url });
}

/** 拉 feed + 课评实体 enrich + 写入 notification store */
export async function loadNotifications(): Promise<NotificationData> {
  const store = useNotificationStore.getState();

  if (isVisitorMode() || !hasAuthenticatedSession()) {
    store.commitLoadResult(emptyNotificationData, null);
    return emptyNotificationData;
  }

  store.setLoading(true);
  try {
    const result = await loadData({
      strategy: 'network-first',
      allowStaleFallback: false,
      getCache: () => {
        const d = store.data;
        const hasData =
          d.commentMessage.length + d.supportMessage.length + d.officialMessage.length >
          0;
        return hasData ? d : null;
      },
      fetch: async () => {
        const feeds = await getFeeds({
          last_time: 0,
          direction: 'After',
          limit: 15,
        });
        console.log(feeds);

        if (!Array.isArray(feeds)) return emptyNotificationData;
        const comments = Object.values(useEvaluationStore.getState().byId);
        return buildMessages(feeds, comments);
      },
      setCache: (data) => store.setData(data),
    });
    store.commitLoadResult(result.data, result.source);
    return result.data;
  } catch {
    store.commitLoadResult(emptyNotificationData, null);
    return emptyNotificationData;
  } finally {
    store.setLoading(false);
  }
}
