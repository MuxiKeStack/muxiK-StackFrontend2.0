import type { CommentInfo } from '@/common/types/commentTypes';
import { bus } from '@/common/utils';
import { useEvaluateDetailStore } from '@/store/evaluation/detail';
import { useCourseStore } from '@/store/course';

/** 原子：评论数 +1 后同步到 course store、bus 与详情顶栏 */
export function syncEvaluationCommentCount(bizId: number): CommentInfo | undefined {
  const updated = useCourseStore.getState().incrementEvaluationCommentCount(bizId);
  if (!updated) return undefined;

  bus.stickyEmit('evaluation', updated);
  useEvaluateDetailStore.getState().patchEvaluationFields(
    { total_comment_count: updated.total_comment_count },
    bizId
  );
  return updated;
}
