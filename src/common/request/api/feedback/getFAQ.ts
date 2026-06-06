import { request } from '../..';
import { BASE_URL, FAQTokenConfig } from './config';

export interface GetFAQRequest {
  record_names: string[];
  table_identify?: string;
  student_id: string;
}

const getFAQ = async (query: GetFAQRequest) => {
  return await request.get('/api/v1/sheet/records/faq', { query } as any, {
    tokenConfig: FAQTokenConfig,
    baseUrl: BASE_URL,
  });
};

export default getFAQ;
