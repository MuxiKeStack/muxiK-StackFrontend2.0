import { getEvaluationEntry } from './entry';
import type { EvaluationDetailEntry } from './types';

export interface EvaluateDetailState {
  byId: Record<number, EvaluationDetailEntry>;
}

export function selectEvaluationEntry(
  state: EvaluateDetailState,
  bizId: number | null
): EvaluationDetailEntry | null {
  if (bizId == null) return null;
  return getEvaluationEntry(state.byId, bizId);
}
