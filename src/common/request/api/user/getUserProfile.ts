import { request } from '../..';

export interface GetUserProfileRequest {}

const getUserProfile = async (userId: number) => {
  return await request.get(`/users/${userId}/profile`);
};

export default getUserProfile;
