import { request } from '../..';

export type EvaluationStatus = 'Public' | 'Private' | 'Folded';

export interface ToggleEvaluationStatusRequest {
  status: EvaluationStatus;
}

const toggleEvaluationStatus = async (
  evaluationId: number,
  body: ToggleEvaluationStatusRequest
) => {
  return await request.post(`/evaluations/${evaluationId}/status`, body);
};

export default toggleEvaluationStatus;
