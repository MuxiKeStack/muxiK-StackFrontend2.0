import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';

import type { CommentInfo } from '@/common/types/commentTypes';
import { COURSE_TYPE, type classType } from '@/common/types/courseType';
import { useEvaluationStore } from '@/store/evaluations';

import { useFeedStore } from './store';

export { loadMoreCourseFeed, refreshCourseFeed } from './load';
export { useFeedStore } from './store';

const ALL_TYPES = Object.values(COURSE_TYPE);

// 首页 feed：把每个分类的 id 顺序 hydrate 成课评数据
export function useFeed() {
  const idsByType = useFeedStore(useShallow((s) => s.idsByType));
  const classType = useFeedStore((s) => s.classType);
  const loading = useFeedStore((s) => s.loading);
  const byId = useEvaluationStore((s) => s.byId);

  const commentsByType = useMemo(() => {
    const out = {} as Record<classType, CommentInfo[]>;
    for (const t of ALL_TYPES) {
      out[t] = (idsByType[t] ?? [])
        .map((id) => byId[id])
        .filter(Boolean) as CommentInfo[];
    }
    return out;
  }, [idsByType, byId]);

  return { commentsByType, classType, loading };
}
