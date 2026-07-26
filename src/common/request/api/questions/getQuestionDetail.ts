import { request } from '../..';

export interface GetQuestionDetailRequest {}

const getQuestionDetail = async (questionId: number) => {
  return await request.get(`/questions/${questionId}/detail`);
};

export default getQuestionDetail;
