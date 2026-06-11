import Taro from '@tarojs/taro';

import { ROUTES } from '@/common/constants/routes';
import type { CommentInfo } from '@/common/types/commentTypes';
import { useEvaluationStore } from '@/store/evaluations';

/** URL 驱动打开课评详情：实体仓 upsert → 带 bizId 跳转 */
export function navigateToEvaluationDetail(item: CommentInfo): void {
  const bizId = Number(item.id);
  if (!bizId) return;
  useEvaluationStore.getState().upsertOne(item);
  void Taro.navigateTo({ url: `${ROUTES.course.evaluateInfo}?bizId=${bizId}` });
}

/** 仅知 bizId 时打开详情（通知等入口） */
export function navigateToEvaluationDetailById(bizId: number | string): void {
  const id = Number(bizId);
  if (!id) return;
  const existing = useEvaluationStore.getState().get(id);
  if (existing) useEvaluationStore.getState().upsertOne(existing);
  void Taro.navigateTo({ url: `${ROUTES.course.evaluateInfo}?bizId=${id}` });
}
