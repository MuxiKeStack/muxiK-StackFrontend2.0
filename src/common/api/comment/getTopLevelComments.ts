import { request } from '../request';

export interface GetTopLevelCommentsRequest {
  biz: string;
  biz_id: number;
  cur_comment_id: number;
  limit: number;
}

const getTopLevelComments = async (query: GetTopLevelCommentsRequest) => {
  return await request.get('/comments/list', { query });
};

export default getTopLevelComments;
