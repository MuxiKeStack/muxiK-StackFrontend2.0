import { usePublisherStore } from '@/store/publisher';

import type { CommentInfo } from '@/common/types/commentTypes';
import type {
  CourseDetailsType,
  PublisherDetailsType,
} from '@/common/types/courseType';

export function extractPublishersFromEvaluations(
  list: CommentInfo[]
): PublisherDetailsType[] {
  const publishers: PublisherDetailsType[] = [];
  list.forEach((c) => {
    if (c.publisher?.id) {
      publishers.push({
        id: c.publisher.id,
        avatar: c.publisher.avatar || '',
        nickname: c.publisher.nickname || '匿名用户',
        using_title: c.publisher.using_title,
        level: c.publisher.level,
      });
    }
  });
  return publishers;
}

export function extractCourseDetailsFromEvaluations(
  list: CommentInfo[]
): Record<number, CourseDetailsType> {
  const courseMap: Record<number, CourseDetailsType> = {};
  list.forEach((c) => {
    if (c.course_id && c.course_name) {
      courseMap[c.course_id] = {
        name: c.course_name,
        teacher: c.teacher_name || '',
        school: '',
      };
    }
  });
  return courseMap;
}

export function cachePublishersFromEvaluations(list: CommentInfo[]): void {
  const publishers = extractPublishersFromEvaluations(list);
  if (publishers.length) {
    usePublisherStore.getState().cachePublishers(publishers);
  }
}
