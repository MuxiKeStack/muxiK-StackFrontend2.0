import { getEvaluationList } from '@/common/request/api/evaluations';
import {
  cachePublishersFromEvaluations,
  extractCourseDetailsFromEvaluations,
} from '@/actions/publisher';
import { useCourseStore } from '@/store/course';

import type { CommentInfo } from '@/common/types/commentTypes';

async function loadCourseFeedPage(currentId: number): Promise<boolean> {
  const { pageSize, classType, comments } = useCourseStore.getState();
  const existingList = comments[classType] || [];
  useCourseStore.setState({ loading: true });

  try {
    const res = await getEvaluationList({
      cur_evaluation_id: currentId,
      limit: pageSize,
      property: classType,
    });
    const resDataList = Array.isArray(res)
      ? [...res].sort((a, b) => (b.id ?? 0) - (a.id ?? 0))
      : [];

    if (!resDataList.length) {
      useCourseStore.setState({ loading: false });
      return false;
    }

    cachePublishersFromEvaluations(resDataList);
    const courseMap = extractCourseDetailsFromEvaluations(resDataList);
    if (Object.keys(courseMap).length) {
      useCourseStore.getState().cacheCourseDetails(courseMap);
    }

    const prevId = resDataList.at(-1)?.id;
    useCourseStore.getState().applyFeedPage({
      classType,
      resDataList,
      currentId,
      existingList,
      prevId,
    });
    return true;
  } catch (e) {
    console.error('[actions/course/feed] 加载评论失败:', e);
    useCourseStore.setState({ loading: false });
    throw e;
  }
}

export async function refreshCourseFeed(): Promise<void> {
  await loadCourseFeedPage(0);
}

export async function loadMoreCourseFeed(): Promise<boolean> {
  const { currentId } = useCourseStore.getState();
  return loadCourseFeedPage(currentId);
}
