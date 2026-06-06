import { request } from '../..';

export interface PublishQuestionRequest {
  biz: string;
  biz_id: number;
  content: string;
}

const publishQuestion = async (body: PublishQuestionRequest) => {
  return await request.post('/questions/publish', body);
};

export default publishQuestion;
