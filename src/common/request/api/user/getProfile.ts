import { request } from '../..';

export interface GetProfileRequest {}

const getProfile = async () => {
  return await request.get('/users/profile');
};

export default getProfile;
