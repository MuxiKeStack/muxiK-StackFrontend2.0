import Taro from '@tarojs/taro';

import { LONG_TOKEN, SHORT_TOKEN, VISITOR } from '@/common/constants/auth';
import { STUDENT_ID, USER_INFO } from '@/common/constants/user';
import { invalidateGateGuardCache } from '@/common/hooks/useGateGuard';
import { bus } from '@/common/utils/eventBus';

export type SessionResetReason = 'logout' | 'visitor' | 'auth-expired' | 'login';

type SessionResetHandler = () => void;

const handlers = new Set<SessionResetHandler>();

export function registerSessionReset(handler: SessionResetHandler): void {
  handlers.add(handler);
}

function runSessionResetHandlers(): void {
  for (const handler of handlers) {
    handler();
  }
}

const USER_PERSIST_KEYS = [
  'muxi-user-store',
  'notification-store',
  'user_myClass_storage',
  'user_collections_storage',
  'evaluation_history_cache',
  'research-store',
  'feedback-faq-cache',
] as const;

const USER_STORAGE_KEYS = [USER_INFO, 'UserSheetToken', 'FAQToken'] as const;

/** 登出 / 游客 / 401 / 正式登录前：统一清空用户域缓存与内存态 */
export function resetSession(reason: SessionResetReason): void {
  if (reason !== 'login') {
    try {
      Taro.removeStorageSync(SHORT_TOKEN);
      Taro.removeStorageSync(LONG_TOKEN);
      Taro.removeStorageSync(VISITOR);
      Taro.removeStorageSync(STUDENT_ID);
    } catch {
      //
    }
  } else {
    try {
      Taro.removeStorageSync(VISITOR);
    } catch {
      //
    }
  }

  for (const key of USER_PERSIST_KEYS) {
    try {
      Taro.removeStorageSync(key);
    } catch {
      //
    }
  }

  for (const key of USER_STORAGE_KEYS) {
    try {
      Taro.removeStorageSync(key);
    } catch {
      //
    }
  }

  runSessionResetHandlers();
  bus.clear();
  invalidateGateGuardCache();
}
