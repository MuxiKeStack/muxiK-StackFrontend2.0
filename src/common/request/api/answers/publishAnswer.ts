import { request } from '../..';

export interface PublishAnswerRequest {
  content: string;
  question_id: number;
}

const publishAnswer = async (body: PublishAnswerRequest) => {
  return await request.post('/answers/publish', body);
};

export default publishAnswer;
