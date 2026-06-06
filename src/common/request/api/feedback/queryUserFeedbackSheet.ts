import { request } from '../..';
import { BASE_URL, UserSheetTokenConfig } from './config';

export interface GetUserFeedbackSheetRequest {
  page_token?: string;
  record_names: string[];
  key_field: string;
  key_value: string;
  table_identify: string;
}

const getUserFeedbackSheet = async (query: GetUserFeedbackSheetRequest) => {
  return await request.get(
    '/api/v1/sheet/records',
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
