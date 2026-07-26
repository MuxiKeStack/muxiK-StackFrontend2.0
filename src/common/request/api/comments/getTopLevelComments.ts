import { request } from '../..';

export interface GetCommentsListRequest {
  biz: string;
  biz_id: number;
  cur_comment_id: number;
  limit: number;
}

const getCommentsList = async (query: GetCommentsListRequest) => {
  return await request.get('/comments/list', { query });
};

export default getCommentsList;
