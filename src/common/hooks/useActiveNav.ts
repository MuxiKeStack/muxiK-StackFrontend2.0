import create from 'zustand';

export type ButtonType = '123' | '456';

interface ActiveButtonState {
  activeButton: ButtonType;
  setActiveButton: (button: ButtonType) => void;
}

const useActiveButtonStore = create<ActiveButtonState>((set) => ({
  activeButton: '123',
  setActiveButton: (button) => set({ activeButton: button }),
}));

export default useActiveButtonStore;
