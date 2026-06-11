import type { EvaluationStatus } from '@/common/request/api/evaluations';
import {
  getEvaluationHistory,
  toggleEvaluationStatus,
} from '@/common/request/api/evaluations';
import type { CommentInfo } from '@/common/types/commentTypes';

import { PAGE_SIZE } from './types';

export async function fetchHistoryPage(
  status: EvaluationStatus,
  curLastId: number
): Promise<CommentInfo[]> {
  const res = await getEvaluationHistory({
    cur_evaluation_id: curLastId || undefined,
    limit: PAGE_SIZE,
    status,
  });
  return (Array.isArray(res) ? res : []) as CommentInfo[];
}

export async function fetchHistoryRefresh(
  status: EvaluationStatus
): Promise<CommentInfo[]> {
  const res = await getEvaluationHistory({
    cur_evaluation_id: undefined,
    limit: PAGE_SIZE,
    status,
  });
  return (Array.isArray(res) ? res : []) as CommentInfo[];
}

export async function apiToggleEvaluationStatus(
  evaluationId: number,
  targetStatus: EvaluationStatus
): Promise<void> {
  await toggleEvaluationStatus(evaluationId, { status: targetStatus });
}
