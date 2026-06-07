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
        // 返回值异常时按拦截处理（fail-closed），避免脏数据绕过门禁
        const result = { status: typeof data.status === 'boolean' ? data.status : false };
        cachedResult = result;
        return result;
      })
      .catch(() => {
        // 状态服务异常时拦截（fail-closed）；不缓存失败，下次进入可重试恢复
        cachedPromise = null;
        return { status: false };
      });
  }

  return cachedPromise;
};

export function invalidateCheckStatus(): void {
  cachedPromise = null;
  cachedResult = null;
}

export default checkStatus;
