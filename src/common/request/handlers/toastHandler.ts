import Taro from '@tarojs/taro';

import { DEBUG } from '@/common/config/features';

import { getErrorMeta } from '../errors';
import { BusinessError } from '../errors/BusinessError';
import type { ErrorHandler } from '../errors/ErrorPipeline';

export const toastHandler: ErrorHandler = async (ctx) => {
  const { error } = ctx;

  if (error.severity === 'silent') return;

  let message = error.message;
  if (error instanceof BusinessError) {
    const meta = getErrorMeta(error.code);
    if (meta.action === 'silent') return;
    if (!error.message || error.message === '请求失败') {
      message = meta.msg;
    }
  }

  if (!DEBUG.ERROR_TOAST) return;

  if (error.severity === 'toast') {
    Taro.showToast({ title: message, icon: 'none', duration: 2000 });
  } else if (error.severity === 'modal') {
    await Taro.showModal({ title: '提示', content: message, showCancel: false });
  }
};
