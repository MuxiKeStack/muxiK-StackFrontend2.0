import { request } from '../..';

export interface UserLoginRequest {
  password: string;
  student_id: string;
}

const userLogin = async (body: UserLoginRequest) => {
  return await request.post('/users/login_ccnu', body, {
    withToken: false,
    returnFullResponse: true,
  });
};

export default userLogin;
