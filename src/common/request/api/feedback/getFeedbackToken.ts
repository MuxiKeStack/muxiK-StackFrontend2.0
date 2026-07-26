import { request } from '../..';
import { BASE_URL } from './config';

export interface GetFeedbackTokenRequest {
  table_identify: string;
}

const getFeedbackToken = async (tableId: GetFeedbackTokenRequest) => {
  return await request.post('/api/v1/auth/table-config/token', tableId, {
    withToken: false,
    baseUrl: BASE_URL,
  });
};

export default getFeedbackToken;
