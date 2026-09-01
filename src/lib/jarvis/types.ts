export type Phase = "boot" | "idle" | "listening" | "thinking" | "speaking";

export type ThemeMode = "night" | "dim" | "bright";

export type AppId =
  | "music"
  | "weather"
  | "notes"
  | "browser"
  | "timer"
  | "calc"
  | "maps"
  | "feed"
  | "settings"
  | "log";

export type Role = "user" | "jarvis";

export type ChatMessage = {
  id: string;
  role: Role;
  text: string;
  at: number;
};

export type Station = {
  name: string;
  url: string;
  tags: string;
  bitrate?: number;
};

export type Note = {
  id: string;
  text: string;
  at: number;
};

export type HudTimer = {
  id: string;
  label: string;
  endsAt: number;
  seconds: number;
};

export type WeatherSnapshot = {
  city: string;
  temp: number;
  code: number;
  wind: number;
  humidity: number;
  daily: { date: string; min: number; max: number; code: number }[];
  fetchedAt: number;
};

export type Win = {
  id: AppId;
  x: number;
  y: number;
  z: number;
};

export type JarvisAction =
  | { type: "play_music"; query: string }
  | { type: "pause_music" }
  | { type: "resume_music" }
  | { type: "stop_music" }
  | { type: "set_volume"; level: number }
  | { type: "open_app"; app: AppId }
  | { type: "close_app"; app: AppId }
  | { type: "close_top" }
  | { type: "open_url"; url: string; title?: string }
  | { type: "search_web"; query: string }
  | { type: "set_timer"; seconds: number; label?: string }
  | { type: "add_note"; text: string }
  | { type: "weather"; city?: string }
  | { type: "set_theme"; mode: ThemeMode }
  | { type: "calculate"; expression: string };

export type JarvisReply = {
  speak: string;
  actions: JarvisAction[];
};

export const APP_META: Record<
  AppId,
  { title: string; hint: string }
> = {
  music: { title: "Müzik", hint: "Radyo ve çalar" },
  weather: { title: "Hava", hint: "Anlık durum" },
  notes: { title: "Notlar", hint: "Hızlı kayıt" },
  browser: { title: "Tarayıcı", hint: "Siteler" },
  timer: { title: "Zamanlayıcı", hint: "Geri sayım" },
  calc: { title: "Hesap", hint: "Hesap makinesi" },
  maps: { title: "Harita", hint: "Konum" },
  feed: { title: "Akış", hint: "Başlıklar" },
  settings: { title: "Ayarlar", hint: "Gemini anahtarı" },
  log: { title: "Günlük", hint: "Konuşma kaydı" },
};

export const APP_ORDER: AppId[] = [
  "music",
  "weather",
  "notes",
  "browser",
  "timer",
  "calc",
  "maps",
  "feed",
];
