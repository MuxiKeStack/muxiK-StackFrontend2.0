import { request } from '../..';

export interface DeleteSearchHistoryRequest {
  remove_all: boolean;
  remove_history_ids: number[];
  search_location: string;
}

const deleteSearchHistory = async (body: DeleteSearchHistoryRequest) => {
  return await request.put('/search/history', body);
};

export default deleteSearchHistory;
