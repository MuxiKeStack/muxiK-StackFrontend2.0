import type { MessageItemProps } from './type';

export function getNotificationUrl(message: MessageItemProps): string | null {
  const { biz, bizId, type } = message;
  if (type === 'official' || !biz) return null;

  if (biz === 'Evaluation') {
    const params = [`bizId=${bizId || ''}`].filter(Boolean).join('&');
    return `/pages/evaluateInfo/index?${params}`;
  }

  if (biz === 'Answer') {
    const params = [`answerId=${bizId || ''}`].filter(Boolean).join('&');
    return `/pages/questionInfo/index?${params}`;
  }

  return null;
}
