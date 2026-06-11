import { getEvaluationList } from '@/common/request/api/evaluations';
import { useEvaluationStore } from '@/store/evaluations';
import { usePublisherStore } from '@/store/publisher';

import { useFeedStore } from './store';

async function loadCourseFeedPage(currentId: number): Promise<boolean> {
  const { pageSize, classType } = useFeedStore.getState();
  useFeedStore.getState().setLoading(true);

  try {
    const res = await getEvaluationList({
      cur_evaluation_id: currentId,
      limit: pageSize,
      property: classType,
    });
    const list = Array.isArray(res)
      ? [...res].sort((a, b) => (b.id ?? 0) - (a.id ?? 0))
      : [];

    if (!list.length) {
      useFeedStore.getState().setLoading(false);
      return false;
    }

    usePublisherStore.getState().ingestFromEvaluations(list);

    // 课评数据进唯一真相,feed 只存 id 顺序
    useEvaluationStore.getState().upsertMany(list);
    const prevId = list.at(-1)?.id;
    useFeedStore.getState().applyPage({
      classType,
      ids: list.map((c) => Number(c.id)).filter(Boolean),
      isRefresh: currentId === 0,
      prevId,
    });
    return true;
  } catch (e) {
    console.error('[main/model] 加载评论失败:', e);
    useFeedStore.getState().setLoading(false);
    throw e;
  }
}

export async function refreshCourseFeed(): Promise<void> {
  await loadCourseFeedPage(0);
}

export async function loadMoreCourseFeed(): Promise<boolean> {
  const { currentId } = useFeedStore.getState();
  return loadCourseFeedPage(currentId);
}
