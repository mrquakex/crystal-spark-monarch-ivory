import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AppId,
  ChatMessage,
  HudTimer,
  Note,
  Phase,
  Station,
  ThemeMode,
  WeatherSnapshot,
  Win,
} from "./types";

export type ProviderId = "gemini" | "grok" | "local";

type JarvisState = {
  hydrated: boolean;
  phase: Phase;
  booted: boolean;
  geminiKey: string;
  voiceEnabled: boolean;
  volume: number;
  muted: boolean;
  theme: ThemeMode;
  nowPlaying: Station | null;
  playing: boolean;
  playBlocked: boolean;
  browserUrl: string;
  browserTitle: string;
  mapQuery: string;
  lastHeard: string;
  lastSpoke: string;
  error: string | null;
  messages: ChatMessage[];
  notes: Note[];
  timers: HudTimer[];
  windows: Win[];
  weather: WeatherSnapshot | null;
  calcValue: string;
  startedAt: number;

  setHydrated: () => void;
  setPhase: (phase: Phase) => void;
  finishBoot: () => void;
  setGeminiKey: (key: string) => void;
  setVoiceEnabled: (on: boolean) => void;
  setVolume: (n: number) => void;
  setMuted: (on: boolean) => void;
  setTheme: (theme: ThemeMode) => void;
  setNowPlaying: (station: Station | null) => void;
  setPlaying: (on: boolean) => void;
  setPlayBlocked: (on: boolean) => void;
  setBrowser: (url: string, title: string) => void;
  setMapQuery: (q: string) => void;
  setLastHeard: (text: string) => void;
  setLastSpoke: (text: string) => void;
  setError: (error: string | null) => void;
  pushMessage: (msg: ChatMessage) => void;
  addNote: (note: Note) => void;
  removeNote: (id: string) => void;
  addTimer: (timer: HudTimer) => void;
  removeTimer: (id: string) => void;
  openWindow: (id: AppId) => void;
  closeWindow: (id: AppId) => void;
  closeTopWindow: () => AppId | null;
  focusWindow: (id: AppId) => void;
  setWeather: (w: WeatherSnapshot | null) => void;
  setCalcValue: (v: string) => void;
};

let zCounter = 10;

export const useJarvis = create<JarvisState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      phase: "boot",
      booted: false,
      geminiKey: "",
      voiceEnabled: true,
      volume: 72,
      muted: false,
      theme: "night",
      nowPlaying: null,
      playing: false,
      playBlocked: false,
      browserUrl: "https://www.wikipedia.org",
      browserTitle: "Wikipedia",
      mapQuery: "İstanbul",
      lastHeard: "",
      lastSpoke: "",
      error: null,
      messages: [],
      notes: [],
      timers: [],
      windows: [],
      weather: null,
      calcValue: "0",
      startedAt: Date.now(),

      setHydrated: () => set({ hydrated: true }),
      setPhase: (phase) => set({ phase }),
      finishBoot: () => set({ booted: true, phase: "idle" }),
      setGeminiKey: (key) => set({ geminiKey: key.trim() }),
      setVoiceEnabled: (on) => set({ voiceEnabled: on }),
      setVolume: (n) => set({ volume: Math.max(0, Math.min(100, n)), muted: n === 0 }),
      setMuted: (on) => set({ muted: on }),
      setTheme: (theme) => set({ theme }),
      setNowPlaying: (station) => set({ nowPlaying: station }),
      setPlaying: (on) => set({ playing: on }),
      setPlayBlocked: (on) => set({ playBlocked: on }),
      setBrowser: (url, title) => set({ browserUrl: url, browserTitle: title }),
      setMapQuery: (q) => set({ mapQuery: q }),
      setLastHeard: (text) => set({ lastHeard: text }),
      setLastSpoke: (text) => set({ lastSpoke: text }),
      setError: (error) => set({ error }),
      pushMessage: (msg) =>
        set({ messages: [...get().messages, msg].slice(-40) }),
      addNote: (note) => set({ notes: [note, ...get().notes].slice(0, 80) }),
      removeNote: (id) => set({ notes: get().notes.filter((n) => n.id !== id) }),
      addTimer: (timer) => set({ timers: [...get().timers, timer] }),
      removeTimer: (id) => set({ timers: get().timers.filter((t) => t.id !== id) }),
      openWindow: (id) => {
        const existing = get().windows.find((w) => w.id === id);
        zCounter += 1;
        if (existing) {
          set({
            windows: get().windows.map((w) => (w.id === id ? { ...w, z: zCounter } : w)),
          });
          return;
        }
        const offset = (get().windows.length % 5) * 22;
        set({
          windows: [
            ...get().windows,
            { id, x: 48 + offset, y: 72 + offset, z: zCounter },
          ],
        });
      },
      closeWindow: (id) => set({ windows: get().windows.filter((w) => w.id !== id) }),
      closeTopWindow: () => {
        const wins = get().windows;
        if (!wins.length) return null;
        const top = [...wins].sort((a, b) => b.z - a.z)[0];
        if (!top) return null;
        set({ windows: wins.filter((w) => w.id !== top.id) });
        return top.id;
      },
      focusWindow: (id) => {
        zCounter += 1;
        set({
          windows: get().windows.map((w) => (w.id === id ? { ...w, z: zCounter } : w)),
        });
      },
      setWeather: (w) => set({ weather: w }),
      setCalcValue: (v) => set({ calcValue: v }),
    }),
    {
      name: "jarvis-os-v1",
      partialize: (s) => ({
        geminiKey: s.geminiKey,
        voiceEnabled: s.voiceEnabled,
        volume: s.volume,
        theme: s.theme,
        notes: s.notes,
        browserUrl: s.browserUrl,
        browserTitle: s.browserTitle,
      }),
      onRehydrateStorage: () => () => {
        useJarvis.getState().setHydrated();
      },
    },
  ),
);
