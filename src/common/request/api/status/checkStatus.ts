import { FEATURES } from '@/common/config/features';

import { request } from '../..';

const MINIPROGRAMS_BASE_URL = 'https://miniprograms.muxixyz.com';

let cachedPromise: Promise<{ status: boolean }> | null = null;
let cachedResult: { status: boolean } | null = null;

const checkStatus = async (): Promise<{ status: boolean }> => {
  if (!FEATURES.CHECK_STATUS) {
    return { status: true };
  }

  if (cachedResult) return cachedResult;

  if (!cachedPromise) {
    cachedPromise = request
      .post(
        '/checkStatus',
        { name: 'kestack' },
        { baseUrl: MINIPROGRAMS_BASE_URL, withToken: false }
      )
      .then((res) => {
        const data = res as { status: boolean };
        const result = { status: typeof data.status === 'boolean' ? data.status : true };
        cachedResult = result;
        return result;
      })
      .catch(() => {
        cachedPromise = null;
        return { status: true };
      });
  }

  return cachedPromise;
};

export function invalidateCheckStatus(): void {
  cachedPromise = null;
  cachedResult = null;
}

export default checkStatus;
