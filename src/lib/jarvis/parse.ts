import type { AppId, JarvisAction, JarvisReply } from "./types";

const APPS = new Set<AppId>([
  "music",
  "weather",
  "notes",
  "browser",
  "timer",
  "calc",
  "maps",
  "feed",
  "settings",
  "log",
]);

function asAction(raw: unknown): JarvisAction | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const type = String(o.type ?? "");
  switch (type) {
    case "play_music":
      return { type, query: String(o.query ?? "chill") };
    case "pause_music":
    case "resume_music":
    case "stop_music":
      return { type };
    case "set_volume":
      return { type, level: Number(o.level ?? 70) };
    case "open_app":
    case "close_app": {
      const app = String(o.app ?? "") as AppId;
      if (!APPS.has(app)) return null;
      return { type, app };
    }
    case "close_top":
      return { type };
    case "open_url":
      return { type, url: String(o.url ?? ""), title: o.title ? String(o.title) : undefined };
    case "search_web":
      return { type, query: String(o.query ?? "") };
    case "set_timer":
      return { type, seconds: Number(o.seconds ?? 60), label: o.label ? String(o.label) : undefined };
    case "add_note":
      return { type, text: String(o.text ?? "") };
    case "weather":
      return { type, city: o.city ? String(o.city) : undefined };
    case "set_theme": {
      const mode = o.mode === "bright" || o.mode === "dim" ? o.mode : "night";
      return { type, mode };
    }
    case "calculate":
      return { type, expression: String(o.expression ?? "") };
    default:
      return null;
  }
}

export function parseModelJson(text: string): JarvisReply {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const blob = (fenced?.[1] ?? trimmed).trim();
  try {
    const parsed = JSON.parse(blob) as { speak?: unknown; actions?: unknown };
    const actions = Array.isArray(parsed.actions)
      ? parsed.actions.map(asAction).filter((a): a is JarvisAction => a !== null)
      : [];
    const speak = String(parsed.speak ?? "").trim() || "Tamam.";
    return { speak, actions };
  } catch {
    return { speak: trimmed.slice(0, 280) || "Tamam.", actions: [] };
  }
}
