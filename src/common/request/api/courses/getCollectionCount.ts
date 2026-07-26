import { request } from '../..';

export interface GetCollectionListRequest {}

const getCollectionCount = async () => {
  return await request.get('/courses/collections/count/mine');
};

export default getCollectionCount;
