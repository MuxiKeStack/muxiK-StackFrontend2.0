import type { CommentInfo } from '@/common/types/commentTypes';
import { bus } from '@/common/utils';
import { useEvaluateDetailStore } from '@/store/evaluation/detail';

/** 列表 / 历史等入口：sticky + 打开详情会话 */
export function openEvaluationDetail(item: CommentInfo): number | null {
  bus.stickyEmit('evaluation', item);
  return useEvaluateDetailStore.getState().openEvaluation(item);
}

/** URL 或无完整 item 时：拉详情后打开会话 */
export async function openEvaluationDetailById(bizId: number): Promise<number | null> {
  const data = await useEvaluateDetailStore.getState().loadEvaluation(bizId);
  if (!data) return null;
  return openEvaluationDetail(data);
}

/** 详情页：按 URL 或 sticky 同步当前课评（兼容 Taro 页面复用） */
export async function syncEvaluationDetailSession(urlBizId?: number): Promise<void> {
  if (urlBizId && urlBizId > 0) {
    const active = useEvaluateDetailStore.getState().activeBizId;
    if (active !== urlBizId) {
      await openEvaluationDetailById(urlBizId);
    }
    return;
  }

  const sticky = bus.getSticky('evaluation') as CommentInfo | undefined;
  const stickyId = Number(sticky?.id);
  if (stickyId > 0 && stickyId !== useEvaluateDetailStore.getState().activeBizId && sticky) {
    openEvaluationDetail(sticky);
  }
}

/** 详情页订阅 sticky 切换 */
export function subscribeEvaluationDetailSticky(): () => void {
  return bus.onSticky('evaluation', (e: CommentInfo) => {
    if (e) openEvaluationDetail(e);
  });
}
