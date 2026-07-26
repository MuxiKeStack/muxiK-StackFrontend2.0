import Taro from '@tarojs/taro';
import { useCallback, useEffect, useState } from 'react';

import { useAuthGuard } from '@/common/hooks/useAuthGuard';
import type { CommentInfo } from '@/common/types/commentTypes';
import { useEvaluationStore } from '@/store/evaluations';

export interface UseLikeActionOptions {
  evaluationId: number;
  stance?: number;
  count?: number;

  onSuccess?: (updated?: CommentInfo) => void;
}

export function useLikeAction({
  evaluationId,
  stance = 0,
  count = 0,
  onSuccess,
}: UseLikeActionOptions) {
  const [isLiked, setIsLiked] = useState(stance === 1);
  const [likeCount, setLikeCount] = useState(count);
  const { guard } = useAuthGuard();

  useEffect(() => {
    setIsLiked(stance === 1);
  }, [stance]);

  useEffect(() => {
    setLikeCount(count);
  }, [count]);

  const toggleLike = useCallback(
    async (e?: { stopPropagation?: () => void }) => {
      e?.stopPropagation?.();
      if (!guard()) return;

      const wasLiked = isLiked;
      const prevCount = likeCount;
      const willLike = !wasLiked;

      void Taro.showLoading({ title: '点赞中' });
      try {
        const updated = await useEvaluationStore
          .getState()
          .endorse(evaluationId, willLike);
        if (updated) {
          setIsLiked(updated.stance === 1);
          if (updated.total_support_count != null) {
            setLikeCount(updated.total_support_count);
          }
          onSuccess?.(updated);
        } else {
          const nextCount = prevCount + (willLike ? 1 : -1);
          setIsLiked(willLike);
          setLikeCount(nextCount);
          onSuccess?.({
            id: evaluationId,
            total_support_count: nextCount,
            stance: willLike ? 1 : 0,
          });
        }
        void Taro.showToast({
          title: willLike ? '点赞成功' : '取消成功',
          icon: 'success',
          duration: 1000,
        });
      } catch {
        void Taro.showToast({ title: '服务端错误', icon: 'error' });
      } finally {
        Taro.hideLoading();
      }
    },
    [evaluationId, isLiked, likeCount, guard, onSuccess]
  );

  return { isLiked, likeCount, toggleLike };
}
