import { request } from '../..';

export interface EvaluationHistoryProps {
  cur_evaluation_id?: number;
  limit?: number;
  status?: string;
}

const getEvaluationHistory = async (query: EvaluationHistoryProps) => {
  return await request.get('/evaluations/list/mine', { query });
};

export default getEvaluationHistory;
