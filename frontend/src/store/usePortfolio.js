import { create } from "zustand";

export const SECTIONS = ["home", "work", "contact"];

export const usePortfolio = create((set, get) => ({
  activeSection: "home",
  setActive: (s) => set({ activeSection: s }),

  // WORK arena state
  carRingIndex: 0,        // which billboard the car is at (0..3)
  isDriving: false,       // animating between stops
  focusedBillboardId: null,
  panelOpen: false,

  setRingIndex: (i) => set({ carRingIndex: i }),
  setDriving: (b) => set({ isDriving: b }),
  setFocused: (id) => set({ focusedBillboardId: id }),
  setPanelOpen: (b) => set({ panelOpen: b }),

  // user options
  soundOn: false,
  reducedMotion: false,
  toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),

  // intro
  introDone: false,
  finishIntro: () => set({ introDone: true }),
}));
