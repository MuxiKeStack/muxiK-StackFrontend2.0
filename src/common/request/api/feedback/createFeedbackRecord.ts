import { request } from '../..';
import { BASE_URL, UserSheetTokenConfig } from './config';

type RecordValue = number | string | boolean;

export interface CreateFeedbackRecordRequest {
  table_identify: string;
  content: string;
  student_id: string;
  contact_info?: string;
  images?: (string | undefined | null)[];
  extra_record?: {
    [key: string]: RecordValue;
  };
}

const createFeedbackRecord = async (body: CreateFeedbackRecordRequest) => {
  return await request.post('/api/v2/sheet/records', body, {
    tokenConfig: UserSheetTokenConfig,
    baseUrl: BASE_URL,
  });
};

export default createFeedbackRecord;
