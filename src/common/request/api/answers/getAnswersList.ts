import { request } from '../..';

export interface GetAnswersListRequest {
  cur_answer_id: number;
  limit: number;
}

const getAnswersList = async (questionId: number, query: GetAnswersListRequest) => {
  return await request.get(`/answers/list/questions/${questionId}`, { query });
};

export default getAnswersList;
