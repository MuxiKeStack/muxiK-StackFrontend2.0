import { request } from '../..';

export interface GetCommentRepliesRequest {
  root_id: number;
  cur_comment_id: number;
  limit: number;
}

const getCommentReplies = async (query: GetCommentRepliesRequest) => {
  return await request.get('/comments/replies/list', { query });
};

export default getCommentReplies;
