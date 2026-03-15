import { request } from '../request';

export interface EvaluationHistoryProps {
  cur_evaluation_id?: number;
  limit?: number;
  status?: string;
}

const getEvalutionHistory = async (query: EvaluationHistoryProps) => {
  return await request.get('/evaluations/list/mine', { query });
};

export default getEvalutionHistory;
