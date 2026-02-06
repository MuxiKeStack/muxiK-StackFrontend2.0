import { request } from '../request';
import { BASE_URL, UserSheetTokenConfig } from './config';

export interface GetFeedbackImgRequest {
  file_tokens: string[];
}

const getFeedbackImg = async (query: GetFeedbackImgRequest) => {
  return await request.get('/api/v1/sheet/photos/url', { query } as any, {
    tokenConfig: UserSheetTokenConfig,
    baseUrl: BASE_URL,
  });
};

export default getFeedbackImg;
