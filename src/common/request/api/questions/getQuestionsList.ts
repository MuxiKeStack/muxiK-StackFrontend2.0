import { request } from '../..';

export interface GetQuestionListRequest {
  biz: string;
  biz_id: number;
  cur_question_id: number;
  limit: number;
}

const getQuestionsList = async (query: GetQuestionListRequest) => {
  return await request.get('/questions/list', { query });
};

export default getQuestionsList;
