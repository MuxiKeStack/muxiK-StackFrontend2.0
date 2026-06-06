import { request } from '../..';
import { BASE_URL, FAQTokenConfig } from './config';

export interface FeedbackFAQRequest {
  table_identify: string;
  is_resolved: boolean;
  record_id: string;
  resolved_field_name: string;
  unresolved_field_name: string;
  user_id: string;
}

const feedbackFAQ = async (body: FeedbackFAQRequest) => {
  return await request.post('/api/v1/sheet/records/faq', body, {
    tokenConfig: FAQTokenConfig,
    baseUrl: BASE_URL,
  });
};

export default feedbackFAQ;
