import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';

import type { CommentInfo } from '@/common/types/commentTypes';
import { useEvaluationStore } from '@/store/evaluations';

import { useClassInfoView } from './store';

export { loadClassInfo, subscribeClassInfoEvents, toggleClassCollect } from './load';
export { useClassInfoView } from './store';

// 班级页:把课评 id 顺序 hydrate 成课评数据
export function useClassInfo() {
  const course = useClassInfoView((s) => s.course);
  const grade = useClassInfoView((s) => s.grade);
  const collect = useClassInfoView((s) => s.collect);
  const questionlist = useClassInfoView((s) => s.questionlist);
  const commentIds = useClassInfoView(useShallow((s) => s.commentIds));
  const byId = useEvaluationStore((s) => s.byId);

  const comments = useMemo(
    () => commentIds.map((id) => byId[id]).filter(Boolean) as CommentInfo[],
    [commentIds, byId]
  );

  return { course, grade, collect, questionlist, comments };
}
