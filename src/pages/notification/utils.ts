import { ROUTES } from '@/common/constants/routes';

import type { MessageItemProps } from './type';

export function getNotificationUrl(message: MessageItemProps): string | null {
  const { biz, bizId, type } = message;
  if (type === 'official' || !biz) return null;

  if (biz === 'Evaluation') {
    const params = [`bizId=${bizId || ''}`].filter(Boolean).join('&');
    return `${ROUTES.course.evaluateInfo}?${params}`;
  }

  if (biz === 'Answer') {
    const params = [`answerId=${bizId || ''}`].filter(Boolean).join('&');
    return `${ROUTES.course.questionInfo}?${params}`;
  }

  return null;
}
