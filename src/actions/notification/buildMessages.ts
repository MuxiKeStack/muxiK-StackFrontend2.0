import { useCourseStore } from '@/store/course';

import { buildMessages, type NotificationData } from '@/store/notification/transforms';

/** 编排：结合 course feed 缓存 enrich 通知消息 */
export async function buildNotificationMessages(
  feeds: unknown[]
): Promise<NotificationData> {
  const courseComments = useCourseStore.getState().comments;
  return buildMessages(feeds, courseComments);
}
