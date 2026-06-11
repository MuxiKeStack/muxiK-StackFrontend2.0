import Taro from '@tarojs/taro';

import { isVisitorMode } from '@/common/utils/isVisitor';

import { resetSession } from '@/common/utils/resetSession';
import { AuthError } from '../errors/AuthError';
import type { ErrorHandler } from '../errors/ErrorPipeline';

//401 → 清除 token + 跳转登录
export const authHandler: ErrorHandler = async (ctx) => {
  if (!(ctx.error instanceof AuthError) || ctx.error.statusCode !== 401) return;

  // resource 域（带 tokenConfig 的反馈/飞书请求）的 401 不代表主登录过期，
  // 不清主 token、不跳登录，交由调用页面自行处理
  if (ctx.error.context?.meta?.scope === 'resource') {
    ctx.stop();
    return;
  }

  if (isVisitorMode()) {
    ctx.stop();
    return;
  }

  resetSession('auth-expired');

  await Taro.showModal({
    title: '登录过期',
    content: '登录已过期，请重新登录',
    showCancel: false,
  });
  Taro.reLaunch({ url: '/pages/login/index' });
  ctx.stop();
};
