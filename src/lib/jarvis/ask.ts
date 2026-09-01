import { askGemini } from "./gemini";
import { parseIntent } from "./intents";
import { contextBlock, SYSTEM_PROMPT } from "./prompt";
import { useJarvis } from "./store";
import { askGrokClient } from "./xai";
import type { JarvisReply } from "./types";

export async function interpret(text: string): Promise<JarvisReply> {
  const local = parseIntent(text);
  if (local) return local;

  const s = useJarvis.getState();
  const time = new Intl.DateTimeFormat("tr-TR", {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
  const ctx = contextBlock({
    time,
    theme: s.theme,
    playing: s.playing && s.nowPlaying ? s.nowPlaying.name : null,
    open: s.windows.map((w) => w.id),
    notes: s.notes.length,
  });
  const history = [
    ...s.messages,
    { id: "tmp", role: "user" as const, text, at: Date.now() },
  ];

  if (s.geminiKey) {
    try {
      return await askGemini(s.geminiKey, history, ctx);
    } catch {
      /* fall through to grok */
    }
  }

  try {
    return await askGrokClient(history, `${SYSTEM_PROMPT}\n${ctx}`);
  } catch {
    return {
      speak:
        "Çevrimdışı moddayım. Müzik, saat, hava, not, zamanlayıcı ve site açmayı deneyin. Gemini anahtarı Ayarlar'da.",
      actions: [],
    };
  }
}
