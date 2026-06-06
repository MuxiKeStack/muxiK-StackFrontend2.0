import { request } from '../..';

export interface GetEvaluationDetailRequest {}

const getEvaluationDetail = async (evaluationId: number) => {
  return await request.get(`/evaluations/${evaluationId}/detail`);
};

export default getEvaluationDetail;
