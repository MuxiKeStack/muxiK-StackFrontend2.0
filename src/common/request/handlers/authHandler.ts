import Taro from '@tarojs/taro';

import { LONG_TOKEN, SHORT_TOKEN } from '@/common/constants/auth';

import { AuthError } from '../errors/AuthError';
import type { ErrorHandler } from '../errors/ErrorPipeline';

//401 → 清除 token + 跳转登录
export const authHandler: ErrorHandler = async (ctx) => {
  if (!(ctx.error instanceof AuthError) || ctx.error.statusCode !== 401) return;

  try {
    Taro.removeStorageSync(SHORT_TOKEN);
    Taro.removeStorageSync(LONG_TOKEN);
  } catch {
    //
  }
  await Taro.showModal({
    title: '登录过期',
    content: '登录已过期，请重新登录',
    showCancel: false,
  });
  Taro.reLaunch({ url: '/pages/login/index' });
  ctx.stop();
};
