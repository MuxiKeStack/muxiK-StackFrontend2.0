import { request } from '../..';

export interface EditProfileRequest {
  avatar?: string;
  nickname?: string;
  using_title?: string;
}

const editProfile = async (body: EditProfileRequest) => {
  return await request.post('/users/edit', body);
};

export default editProfile;
