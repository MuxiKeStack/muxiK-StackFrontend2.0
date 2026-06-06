import { request } from '../..';

export interface GetAccessTokenRequest {}

const getAccessToken = async () => {
  return await request.get('/tube/access_token');
};

export default getAccessToken;
