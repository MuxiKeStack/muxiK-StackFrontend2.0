import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { useCourseStore } from '@/store/useCourseStore';

import { getEvaluationDetail } from '@/common/request/api/evaluations';
import { getFeeds } from '@/common/request/api/feed';
import { createTaroJSONStorage, formatDate } from '@/common/utils';
import type { MessageItemProps } from '@/pages/notification/type';

import { loadData } from './loadUtils';
import type { DataSource } from './types';

interface NotificationData {
  commentMessage: MessageItemProps[];
  supportMessage: MessageItemProps[];
  officialMessage: MessageItemProps[];
}

interface NotificationStore {
  data: NotificationData;
  source: DataSource | null;
  loading: boolean;
  load: () => Promise<NotificationData>;
}

async function buildMessages(feeds: unknown[]): Promise<NotificationData> {
  const storeComments = useCourseStore.getState().comments;
  const evaluationCache = new Map<
    string,
    { course_name?: string; teacher_name?: string }
  >();

  Object.values(storeComments).forEach((list) => {
    if (Array.isArray(list)) {
      list.forEach((c: { id?: number; course_name?: string; teacher_name?: string }) => {
        if (c.id && (c.course_name || c.teacher_name)) {
          evaluationCache.set(String(c.id), {
            course_name: c.course_name,
            teacher_name: c.teacher_name,
          });
        }
      });
    }
  });

  const allBizIds = [
    ...new Set(
      (feeds as Array<{ content?: { bizId?: string } }>).map((item) =>
        String(item.content?.bizId || '')
      )
    ),
  ].filter(Boolean);

  const uncachedBizIds = allBizIds.filter((id) => !evaluationCache.has(id));
  if (uncachedBizIds.length > 0) {
    const results = await Promise.allSettled(
      uncachedBizIds.map((id) => getEvaluationDetail(Number(id)))
    );
    results.forEach((r, i) => {
      if (r.status === 'fulfilled' && r.value) {
        const detail = r.value as { course_name?: string; teacher_name?: string };
        evaluationCache.set(uncachedBizIds[i], {
          course_name: detail.course_name,
          teacher_name: detail.teacher_name,
        });
      }
    });
  }

  const commentList: MessageItemProps[] = [];
  const supportList: MessageItemProps[] = [];
  const officialList: MessageItemProps[] = [];

  (
    feeds as Array<{ type: string; ctime: number; content?: Record<string, unknown> }>
  ).forEach((item) => {
    const content = item.content || {};
    const timeStamp = formatDate(new Date(item.ctime).toISOString(), 'yyyy.MM.dd hh:mm');
    const evaluation = evaluationCache.get(String(content.bizId));

    if (item.type === 'Comment') {
      commentList.push({
        type: 'comment',
        userName: (content.nickname as string) || '',
        avatar: (content.avatar as string) || '',
        reply: (content.content as string) || '',
        originalComment: (content.bizContent as string) || '',
        title: evaluation?.course_name || (content.bizId as string) || '',
        teacher: evaluation?.teacher_name || '',
        biz: (content.biz as string) || '',
        bizId: (content.bizId as string) || '',
        commentId: (content.commentId as string) || '',
        ctime: item.ctime,
        timeStamp,
      });
    } else if (item.type === 'Support') {
      supportList.push({
        type: 'support',
        userName: (content.nickname as string) || '',
        avatar: (content.avatar as string) || '',
        originalComment: (content.content as string) || '',
        title: evaluation?.course_name || (content.bizId as string) || '',
        biz: (content.biz as string) || '',
        bizId: (content.bizId as string) || '',
        ctime: item.ctime,
        timeStamp,
      });
    } else {
      officialList.push({
        type: 'official',
        userName: '系统通知',
        avatar: '',
        title: (content.title as string) || item.type || '',
        description: (content.content as string) || '',
        ctime: item.ctime,
        timeStamp,
      });
    }
  });

  return {
    commentMessage: commentList,
    supportMessage: supportList,
    officialMessage: officialList,
  };
}

const emptyData: NotificationData = {
  commentMessage: [],
  supportMessage: [],
  officialMessage: [],
};

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      data: emptyData,
      source: null,
      loading: false,

      async load() {
        set({ loading: true });
        try {
          const result = await loadData({
            strategy: 'network-first',
            getCache: () => {
              const d = get().data;
              const hasData =
                d.commentMessage.length +
                  d.supportMessage.length +
                  d.officialMessage.length >
                0;
              return hasData ? d : null;
            },
            fetch: async () => {
              const feeds = await getFeeds({
                last_time: 0,
                direction: 'After',
                limit: 15,
              });
              if (!Array.isArray(feeds)) return emptyData;
              return buildMessages(feeds);
            },
            setCache: (data) => set({ data }),
          });
          set({ data: result.data, source: result.source });
          return result.data;
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: 'notification-store',
      storage: createTaroJSONStorage(),
      partialize: (state) => ({ data: state.data }),
    }
  )
);
