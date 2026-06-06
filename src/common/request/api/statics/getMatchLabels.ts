import { request } from '../..';

export interface GetMatchLabelsRequest {
  [key: string]: string;
}

const getMatchLabels = async (query: GetMatchLabelsRequest) => {
  return await request.get('/statics/match/labels', { query });
};

export default getMatchLabels;
