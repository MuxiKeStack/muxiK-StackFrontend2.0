import { request } from '../..';

export interface EndorseEvaluationRequest {
  stance: number;
}

const endorseEvaluation = async (
  evaluationId: number,
  body: EndorseEvaluationRequest
) => {
  return await request.post(`/evaluations/${evaluationId}/endorse`, body);
};

export default endorseEvaluation;
