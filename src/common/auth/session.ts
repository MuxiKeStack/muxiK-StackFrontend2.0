import Taro from '@tarojs/taro';

import { LONG_TOKEN, SHORT_TOKEN, VISITOR } from '@/common/constants/auth';

const LOGIN_ROUTE = 'pages/login/index';

export function hasAuthenticatedSession(): boolean {
  const short = Taro.getStorageSync<string>(SHORT_TOKEN);
  const long = Taro.getStorageSync<string>(LONG_TOKEN);
  return !!(short?.trim() || long?.trim());
}

// 正式登录态或游客模式
export function hasStoredSession(): boolean {
  return hasAuthenticatedSession() || !!Taro.getStorageSync(VISITOR);
}

// 冷启动默认落在登录页（单页栈），用于区分分享/扫码深链
export function isColdStartOnLoginPage(): boolean {
  const pages = Taro.getCurrentPages();
  if (pages.length !== 1) return false;
  return (pages[pages.length - 1]?.route || '') === LOGIN_ROUTE;
}

export function readResponseHeader(
  headers: Record<string, unknown> | undefined,
  name: string
): string | undefined {
  if (!headers) return undefined;
  const target = name.toLowerCase();
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() !== target) continue;
    if (typeof value === 'string' && value.trim()) return value;
  }
  return undefined;
}
