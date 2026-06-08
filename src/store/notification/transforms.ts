import { getEvaluationDetail } from '@/common/request/api/evaluations';
import { formatDate } from '@/common/utils';
import type { MessageItemProps } from '@/pages/notification/type';

import type { classType } from '@/common/types/courseType';
import type { CommentInfo } from '@/common/types/commentTypes';

type CourseDetail = { course_name?: string; teacher_name?: string };
type CourseDetailIndex = Map<string, CourseDetail>;
type FeedItem = { type: string; ctime: number; content?: Record<string, unknown> };

export interface NotificationData {
  commentMessage: MessageItemProps[];
  supportMessage: MessageItemProps[];
  officialMessage: MessageItemProps[];
}

export const emptyNotificationData: NotificationData = {
  commentMessage: [],
  supportMessage: [],
  officialMessage: [],
};

function collectCourseDetailsFromComments(
  storeComments: Record<classType, CommentInfo[]>
): CourseDetailIndex {
  const index: CourseDetailIndex = new Map();

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

function collectBizIdsFromFeeds(feeds: unknown[]): string[] {
  return [
    ...new Set(
      (feeds as Array<{ content?: { bizId?: string } }>).map((item) =>
        String(item.content?.bizId || '')
      )
    ),
  ].filter(Boolean);
}

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

export async function buildMessages(
  feeds: unknown[],
  storeComments: Record<classType, CommentInfo[]>
): Promise<NotificationData> {
  const courseDetails = collectCourseDetailsFromComments(storeComments);
  const bizIds = collectBizIdsFromFeeds(feeds);
  await fetchMissingCourseDetails(courseDetails, bizIds);
  return partitionFeedsIntoMessages(feeds, courseDetails);
}
