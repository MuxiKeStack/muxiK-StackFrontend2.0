import { request } from '../..';

export interface GetEvaluationListRequest {
  cur_evaluation_id: number;
  limit: number;
  property: string;
}

const getEvaluationList = async (query: GetEvaluationListRequest) => {
  return await request.get('/evaluations/list/all', { query });
};

export default getEvaluationList;
