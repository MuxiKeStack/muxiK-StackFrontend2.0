import type { CommentInfo } from '@/common/types/commentTypes';
import { useEvaluateDetailStore } from '@/store/evaluation/detail';
import { useEvaluationHistoryStore } from '@/store/evaluation/history';
import { useClassInfoStore } from '@/store/classInfo';
import { useCourseStore } from '@/store/course';

/** 原子：将点赞态同步到所有持有课评列表的 store */
export function syncEvaluationLike(
  evaluationId: number,
  willLike: boolean
): CommentInfo | undefined {
  const patches = [
    useCourseStore.getState().patchEvaluationLike(evaluationId, willLike),
    useClassInfoStore.getState().patchEvaluationLike(evaluationId, willLike),
    useEvaluationHistoryStore.getState().patchEvaluationLike(evaluationId, willLike),
    useEvaluateDetailStore.getState().patchEvaluationLike(evaluationId, willLike),
  ];
  return patches.find((item) => item != null);
}
