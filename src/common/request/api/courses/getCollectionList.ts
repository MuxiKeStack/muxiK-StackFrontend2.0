import { request } from '../..';

export interface GetCollectionListRequest {
  cur_collection_id: number;
  limit: number;
}

const getCollectionList = async (query: GetCollectionListRequest) => {
  return await request.get('/courses/collections/list/mine', { query });
};

export default getCollectionList;
