import { create } from 'zustand';

export type ActiveButtonType = 'Home' | 'Download' | '+' | 'Massage' | 'Profile';

interface ActiveButtonState {
  activeButton: ActiveButtonType;
  setActiveButton: (button: ActiveButtonType) => void;
}

export const useActiveButtonStore = create<ActiveButtonState>((set) => ({
  activeButton: 'Home',
  setActiveButton: (button) => set({ activeButton: button }),
}));
