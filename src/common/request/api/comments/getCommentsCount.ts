import { request } from '../..';

export interface GetCommentsCountRequest {
  biz: string;
  biz_id: number;
}

const getCommentsCount = async (query: GetCommentsCountRequest) => {
  return await request.get('/comments/count', { query });
};

export default getCommentsCount;
