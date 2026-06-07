import Taro from '@tarojs/taro';
import { useCallback, useEffect, useState } from 'react';

import { useCourseStore } from '@/store/useCourseStore';

import { useAuthGuard } from '@/common/hooks/useAuthGuard';
import type { CommentInfo } from '@/common/types/commentTypes';
import { COMMENT_ACTIONS } from '@/common/types/courseType';

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
  const endorse = useCourseStore((s) => s.endorse);
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
        const updated = await endorse(
          evaluationId,
          wasLiked ? COMMENT_ACTIONS.DISLIKE : COMMENT_ACTIONS.LIKE
        );
        const nextCount = prevCount + (willLike ? 1 : -1);
        setIsLiked(willLike);
        setLikeCount(nextCount);
        void Taro.showToast({
          title: willLike ? '点赞成功' : '取消成功',
          icon: 'success',
          duration: 1000,
        });
        onSuccess?.(
          updated ?? {
            id: evaluationId,
            total_support_count: nextCount,
            stance: willLike ? 1 : 0,
          }
        );
      } catch {
        void Taro.showToast({ title: '服务端错误', icon: 'error' });
      } finally {
        Taro.hideLoading();
      }
    },
    [evaluationId, isLiked, likeCount, endorse, guard, onSuccess]
  );

  return { isLiked, likeCount, toggleLike };
}
