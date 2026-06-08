import type { CommentInfo } from '@/common/types/commentTypes';

export function patchEvaluationFields(
  evaluation: CommentInfo | null,
  fields: Partial<CommentInfo>
): CommentInfo | null {
  if (!evaluation) return evaluation;
  return { ...evaluation, ...fields };
}
