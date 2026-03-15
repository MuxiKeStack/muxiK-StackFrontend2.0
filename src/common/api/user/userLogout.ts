import { request } from '../request';

const userLogout = async () => {
  return await request.post('/users/logout');
};

export default userLogout;
