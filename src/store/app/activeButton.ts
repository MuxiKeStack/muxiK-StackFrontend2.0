import { create } from 'zustand';

import { registerSessionReset } from '@/common/utils/resetSession';

export type ActiveButtonType = 'Home' | 'Download' | '+' | 'Massage' | 'Profile';

interface ActiveButtonState {
  activeButton: ActiveButtonType;
  setActiveButton: (button: ActiveButtonType) => void;
}

/** Tab 栏高亮等全局 UI 态（非业务实体） */
export const useActiveButtonStore = create<ActiveButtonState>((set) => ({
  activeButton: 'Home',
  setActiveButton: (button) => set({ activeButton: button }),
}));

registerSessionReset(() => useActiveButtonStore.getState().setActiveButton('Home'));
