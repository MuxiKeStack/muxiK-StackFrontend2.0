import type { EvaluationDetailEntry } from './types';

export function emptyEvaluationEntry(): EvaluationDetailEntry {
  return { comments: [], commentsLoaded: false, hasMore: false };
}

export function getEvaluationEntry(
  byId: Record<number, EvaluationDetailEntry>,
  bizId: number
): EvaluationDetailEntry {
  return byId[bizId] ?? emptyEvaluationEntry();
}

export function patchEvaluationEntry(
  byId: Record<number, EvaluationDetailEntry>,
  bizId: number,
  patch: Partial<EvaluationDetailEntry>
): Record<number, EvaluationDetailEntry> {
  const prev = getEvaluationEntry(byId, bizId);
  return { ...byId, [bizId]: { ...prev, ...patch } };
}
