import { request } from '../request';

export interface GetSearchHistoryRequest {
  search_location: string;
}

const getSearchHistory = async (query: GetSearchHistoryRequest) => {
  return await request.get('/search/history', { query });
};

export default getSearchHistory;
