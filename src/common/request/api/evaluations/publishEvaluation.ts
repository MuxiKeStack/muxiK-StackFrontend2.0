import { request } from '../..';

export interface PublishEvaluationRequest {
  assessments?: string[];
  content?: string;
  course_id?: number;
  features?: string[];
  id?: number;
  is_anonymous?: boolean;
  star_rating?: number;
  status?: 'Public' | 'Private';
}

const publishEvaluation = async (body: PublishEvaluationRequest) => {
  return await request.post('/evaluations/save', body);
};

export default publishEvaluation;
