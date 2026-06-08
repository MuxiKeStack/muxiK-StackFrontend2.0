import { useUserStore } from '@/store/user';

/** 编排：登录后拉取用户资料与积分 */
export async function syncUserAfterLogin(): Promise<void> {
  await Promise.all([
    useUserStore.getState().ensureProfile(),
    useUserStore.getState().ensurePoints(),
  ]);
}
