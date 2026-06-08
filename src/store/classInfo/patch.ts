import { patchCommentInfoLike } from '@/store/evaluation/shared';

import type { CommentInfo } from '@/common/types/commentTypes';
import type { WebQuestionVo } from '@/common/types/userTypes';

import type { QuestionUpsertPayload } from './types';

export function upsertQuestionList(
  questionlist: WebQuestionVo[],
  courseId: number,
  question: QuestionUpsertPayload
): WebQuestionVo[] | null {
  if (!question || question.biz_id !== courseId) return null;
  if (question.id == null) {
    return [question as WebQuestionVo, ...questionlist];
  }
  const idx = questionlist.findIndex((item) => item.id === question.id);
  if (idx >= 0) {
    const updated = [...questionlist];
    updated[idx] = { ...questionlist[idx], ...question };
    return updated;
  }
  return [question as WebQuestionVo, ...questionlist];
}

export function prependEvaluationList(
  comments: CommentInfo[],
  courseId: number,
  evaluation: CommentInfo
): CommentInfo[] | null {
  if (!evaluation || evaluation.course_id !== courseId) return null;
  return [evaluation, ...comments];
}

export function patchEvaluationLikeInList(
  comments: CommentInfo[],
  evaluationId: number,
  willLike: boolean
): { comments: CommentInfo[]; patched?: CommentInfo } {
  const targetId = Number(evaluationId);
  const idx = comments.findIndex((c) => Number(c.id) === targetId);
  if (idx === -1) return { comments };
  const next = [...comments];
  const patched = patchCommentInfoLike(next[idx], willLike);
  next[idx] = patched;
  return { comments: next, patched };
}
