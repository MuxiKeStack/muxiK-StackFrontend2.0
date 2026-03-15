import { request } from '../request';

export interface signGradeSharingRequest {
  wants_to_sign: true;
}

const signGradeSharing = async (body: signGradeSharingRequest) => {
  return await request.post('/grades/sign', body);
};

export default signGradeSharing;
