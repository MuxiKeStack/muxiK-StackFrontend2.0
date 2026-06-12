import { request } from '../..';
import { BASE_URL, UserSheetTokenConfig } from './config';

export interface GetUserFeedbackSheetRequest {
  student_id: string;
  table_identify: string;
  page_token?: string;
  limit_size?: number;
}

const getUserFeedbackSheet = async (query: GetUserFeedbackSheetRequest) => {
  return await request.get(
    '/api/v2/sheet/records',
    {
      query,
    } as any,
    {
      tokenConfig: UserSheetTokenConfig,
      baseUrl: BASE_URL,
    }
  );
};

export default getUserFeedbackSheet;
