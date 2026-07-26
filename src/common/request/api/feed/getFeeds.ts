import { request } from '../..';

export interface GetFeedsRequest {
  last_time: number;
  direction: 'Before' | 'After';
  limit: number;
}

const getFeeds = async (query: GetFeedsRequest) => {
  return await request.get('/feed/events_list', { query });
};

export default getFeeds;
