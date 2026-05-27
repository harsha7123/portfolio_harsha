import { create } from "zustand";

export const SECTIONS = ["home", "work", "contact"];

// detect prefs/quality up front
const reducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const isMobile =
  typeof navigator !== "undefined" &&
  /Mobi|Android|iPhone|iPad/.test(navigator.userAgent);

const cores =
  typeof navigator !== "undefined" ? navigator.hardwareConcurrency || 4 : 4;

const quality = isMobile || cores < 4 ? "low" : cores < 8 ? "mid" : "high";

const storedSound =
  typeof window !== "undefined" && window.localStorage
    ? window.localStorage.getItem("harsha_sound") === "on"
    : false;

const storedFreeDrive =
  typeof window !== "undefined" && window.localStorage
    ? window.localStorage.getItem("harsha_free_drive") === "on"
    : false;

export const usePortfolio = create((set, get) => ({
  activeSection: "home",
  setActive: (s) => set({ activeSection: s }),

  // WORK arena
  carRingIndex: 0,
  isDriving: false,
  focusedBillboardId: null,
  panelOpen: false,

  // Continuous free-drive mode (Tier 2 — keyboard / on-screen control)
  freeDrive: storedFreeDrive,
  carAngle: 0, // current absolute angle in radians (free-drive uses this)
  carVelocity: 0, // radians/sec

  setRingIndex: (i) => set({ carRingIndex: i }),
  setDriving: (b) => set({ isDriving: b }),
  setFocused: (id) => set({ focusedBillboardId: id }),
  setPanelOpen: (b) => set({ panelOpen: b }),
  setCarAngle: (a) => set({ carAngle: a }),
  setCarVelocity: (v) => set({ carVelocity: v }),
  toggleFreeDrive: () =>
    set((s) => {
      const v = !s.freeDrive;
      if (typeof window !== "undefined")
        window.localStorage.setItem("harsha_free_drive", v ? "on" : "off");
      return { freeDrive: v };
    }),

  // user options
  soundOn: storedSound,
  reducedMotion,
  quality,
  setSound: (v) => {
    if (typeof window !== "undefined")
      window.localStorage.setItem("harsha_sound", v ? "on" : "off");
    set({ soundOn: v });
  },
  toggleSound: () => {
    const v = !get().soundOn;
    if (typeof window !== "undefined")
      window.localStorage.setItem("harsha_sound", v ? "on" : "off");
    set({ soundOn: v });
  },

  // intro
  introDone: false,
  finishIntro: () => set({ introDone: true }),
}));
