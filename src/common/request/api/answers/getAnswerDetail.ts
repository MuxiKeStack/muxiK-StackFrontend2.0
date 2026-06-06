import { request } from '../..';

export interface GetAnswerDetailRequest {}

const getAnswerDetail = async (answerId: number) => {
  return await request.get(`/answers/${answerId}/detail`);
};

export default getAnswerDetail;
