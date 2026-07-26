import { request } from '../..';

const userLogout = async () => {
  return await request.post('/users/logout');
};

export default userLogout;
