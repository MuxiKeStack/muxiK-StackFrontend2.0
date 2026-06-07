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

type CourseDetail = { course_name?: string; teacher_name?: string };
type CourseDetailIndex = Map<string, CourseDetail>;
type FeedItem = { type: string; ctime: number; content?: Record<string, unknown> };

// 从评课广场缓存里收集课程名/教师名，供消息列表展示
function collectCourseDetailsFromComments(): CourseDetailIndex {
  const index: CourseDetailIndex = new Map();
  const storeComments = useCourseStore.getState().comments;

  Object.values(storeComments).forEach((list) => {
    if (!Array.isArray(list)) return;
    list.forEach((c: { id?: number; course_name?: string; teacher_name?: string }) => {
      if (c.id && (c.course_name || c.teacher_name)) {
        index.set(String(c.id), {
          course_name: c.course_name,
          teacher_name: c.teacher_name,
        });
      }
    });
  });
  return index;
}

// 从 feed 列表提取去重后的 bizId
function collectBizIdsFromFeeds(feeds: unknown[]): string[] {
  return [
    ...new Set(
      (feeds as Array<{ content?: { bizId?: string } }>).map((item) =>
        String(item.content?.bizId || '')
      )
    ),
  ].filter(Boolean);
}

// 对缓存中缺失的 bizId 批量拉取评课详情并写入索引
async function fetchMissingCourseDetails(
  index: CourseDetailIndex,
  bizIds: string[]
): Promise<void> {
  const missingIds = bizIds.filter((id) => !index.has(id));
  if (!missingIds.length) return;

  const results = await Promise.allSettled(
    missingIds.map((id) => getEvaluationDetail(Number(id)))
  );
  results.forEach((result, i) => {
    if (result.status === 'fulfilled' && result.value) {
      const detail = result.value as CourseDetail;
      index.set(missingIds[i], {
        course_name: detail.course_name,
        teacher_name: detail.teacher_name,
      });
    }
  });
}

// 将 feed 列表按消息类型分组为通知数据结构
function partitionFeedsIntoMessages(
  feeds: unknown[],
  courseDetails: CourseDetailIndex
): NotificationData {
  const commentList: MessageItemProps[] = [];
  const supportList: MessageItemProps[] = [];
  const officialList: MessageItemProps[] = [];

  (feeds as FeedItem[]).forEach((item) => {
    const content = item.content || {};
    const timeStamp = formatDate(new Date(item.ctime).toISOString(), 'yyyy.MM.dd hh:mm');
    const evaluation = courseDetails.get(String(content.bizId));

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

async function buildMessages(feeds: unknown[]): Promise<NotificationData> {
  const courseDetails = collectCourseDetailsFromComments();
  const bizIds = collectBizIdsFromFeeds(feeds);
  await fetchMissingCourseDetails(courseDetails, bizIds);
  return partitionFeedsIntoMessages(feeds, courseDetails);
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
