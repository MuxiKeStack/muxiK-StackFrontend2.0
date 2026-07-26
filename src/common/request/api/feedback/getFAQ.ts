import { request } from '../..';
import { BASE_URL, FAQTokenConfig } from './config';

export interface GetFAQRequest {
  table_identify?: string;
  student_id: string;
}

const getFAQ = async (query: GetFAQRequest) => {
  return await request.get('/api/v2/sheet/records/faq', { query } as any, {
    tokenConfig: FAQTokenConfig,
    baseUrl: BASE_URL,
  });
};

export default getFAQ;
