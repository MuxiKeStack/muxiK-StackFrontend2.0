import { FEATURES } from '@/common/config/features';

import { request } from '../..';

import { getCheckStatusCache, setCheckStatusCache } from './cache';

const MINIPROGRAMS_BASE_URL = 'https://miniprograms.muxixyz.com';

const checkStatus = async (): Promise<{ status: boolean }> => {
  if (!FEATURES.CHECK_STATUS) {
    return { status: true };
  }

  const { cachedPromise, cachedResult } = getCheckStatusCache();
  if (cachedResult) return cachedResult;

  if (!cachedPromise) {
    const promise = request
      .post(
        '/checkStatus',
        { name: 'kestack' },
        { baseUrl: MINIPROGRAMS_BASE_URL, withToken: false }
      )
      .then((res) => {
        const data = res as { status: boolean };
        // 返回值异常时按拦截处理（fail-closed），避免脏数据绕过门禁
        const result = { status: typeof data.status === 'boolean' ? data.status : false };
        setCheckStatusCache(promise, result);
        return result;
      })
      .catch(() => {
        // 状态服务异常时拦截（fail-closed）；不缓存失败，下次进入可重试恢复
        setCheckStatusCache(null, null);
        return { status: false };
      });
    setCheckStatusCache(promise, null);
    return promise;
  }

  return cachedPromise;
};

export default checkStatus;
