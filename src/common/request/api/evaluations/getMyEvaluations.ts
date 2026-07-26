import { request } from '../..';

export interface GetMyEvaluationsRequest {
  cur_evaluation_id: number;
  limit: number;
  status: string;
}

const getMyEvaluations = async (query: GetMyEvaluationsRequest) => {
  return await request.get('/evaluations/list/mine', { query });
};

export default getMyEvaluations;
