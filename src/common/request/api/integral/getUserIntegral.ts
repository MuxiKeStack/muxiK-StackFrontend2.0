import { request } from '../..';

export interface GetUserIntegral {}

const getUserIntegral = async () => {
  return await request.get(`/points/users/mine`);
};

export default getUserIntegral;
