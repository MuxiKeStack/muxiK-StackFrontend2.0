import { signGradeSharing } from '@/common/request/api/grade';

export const useGradeStore = {
  async signSharing(wantsToSign: boolean) {
    return signGradeSharing({ wants_to_sign: wantsToSign });
  },
};
