import type { AppId, JarvisAction, JarvisReply } from "./types";
import { fold, lookupSite } from "./sites";

const APP_ALIASES: Record<string, AppId> = {
  muzik: "music",
  music: "music",
  radyo: "music",
  hava: "weather",
  weather: "weather",
  not: "notes",
  notlar: "notes",
  notes: "notes",
  tarayici: "browser",
  browser: "browser",
  zamanlayici: "timer",
  timer: "timer",
  alarm: "timer",
  hesap: "calc",
  hesapmakinesi: "calc",
  calculator: "calc",
  harita: "maps",
  maps: "maps",
  haritalar: "maps",
  akis: "feed",
  haber: "feed",
  news: "feed",
  ayar: "settings",
  ayarlar: "settings",
  settings: "settings",
  gunluk: "log",
  log: "log",
};

function clock(): string {
  return new Intl.DateTimeFormat("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

function parseDuration(n: string): number | null {
  const m = n.match(/(\d+)\s*(saniye|sn|second|sec|dakika|dk|min|minute|saat|hour|hr)/);
  if (!m) return null;
  const v = Number(m[1]);
  const u = m[2];
  if (/saniye|sn|sec/.test(u)) return v;
  if (/saat|hour|hr/.test(u)) return v * 3600;
  return v * 60;
}

function reply(speak: string, ...actions: JarvisAction[]): JarvisReply {
  return { speak, actions };
}

export function parseIntent(raw: string): JarvisReply | null {
  const text = raw.trim();
  if (!text) return null;
  const n = fold(text);

  if (/(saat kac|saati soyle|what time|time is it)/.test(n)) {
    return reply(`Saat ${clock()}.`);
  }
  if (/(hangi gun|bugunun tarihi|what date|today)/.test(n) && /tarih|date|gun/.test(n)) {
    const d = new Intl.DateTimeFormat("tr-TR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(new Date());
    return reply(`Bugün ${d}.`);
  }

  if (/(sesi kapat|mute|sustur)/.test(n) && !/muzik/.test(n)) {
    return reply("Sesi kestim.", { type: "set_volume", level: 0 });
  }
  if (/(sesi ac|unmute)/.test(n)) {
    return reply("Ses açık.", { type: "set_volume", level: 72 });
  }
  const vol = n.match(/ses(?:i)?\s*(?:yuzde|%)?\s*(\d+)/) || n.match(/volume\s*(\d+)/);
  if (vol) {
    const level = Math.max(0, Math.min(100, Number(vol[1])));
    return reply(`Ses ${level}.`, { type: "set_volume", level });
  }
  if (/(sesi kis|kıs|volume down)/.test(n)) {
    return reply("Kısıyorum.", { type: "set_volume", level: 35 });
  }
  if (/(sesi yukselt|sesi arttir|volume up)/.test(n)) {
    return reply("Yükseltiyorum.", { type: "set_volume", level: 90 });
  }

  if (/(muzigi durdur|duraklat|pause|pause music)/.test(n)) {
    return reply("Durdurdum.", { type: "pause_music" });
  }
  if (/(muzigi kapat|stop music|radyoyu kapat)/.test(n)) {
    return reply("Müziği kapattım.", { type: "stop_music" });
  }
  if (/(devam et|resume|muzige devam|calmaya devam)/.test(n)) {
    return reply("Devam.", { type: "resume_music" });
  }

  const play =
    n.match(/^(?:bana |biraz )?(?:lofi|jazz|rock|pop|ambient|elektronik|chill|rap|metal|klasik|turkce).*(?:cal|play)/) ||
    n.match(/(?:cal|play|radyo ac|muzik ac|muzik cal|play music|play some)\s+(.*)$/) ||
    n.match(/^(?:cal|play)\s+(.+)/);
  if (/(muzik cal|muzik ac|radyo ac|play music|biraz muzik|sarki cal)/.test(n) && !play) {
    return reply("Açıyorum.", { type: "play_music", query: "chill" }, { type: "open_app", app: "music" });
  }
  if (play) {
    const q = (play[1] ?? n)
      .replace(/^(bana|biraz|lutfen)\s+/, "")
      .replace(/\s+(cal|play|ac)$/g, "")
      .replace(/^(cal|play|ac)\s+/, "")
      .trim();
    return reply("Çalıyorum.", { type: "play_music", query: q || "chill" }, { type: "open_app", app: "music" });
  }
  if (/^(lofi|jazz|chill|ambient|elektronik)\s*(cal|ac)?$/.test(n)) {
    return reply("Çalıyorum.", { type: "play_music", query: n }, { type: "open_app", app: "music" });
  }

  if (/(hava durumu|havasi nasil|weather)/.test(n)) {
    const city = text
      .replace(/hava durumu/i, "")
      .replace(/havası nasıl/i, "")
      .replace(/weather( in)?/i, "")
      .replace(/\b(icin|için|ne|nasil|nasıl)\b/gi, "")
      .trim();
    return reply("Bakıyorum.", { type: "weather", city: city || undefined }, { type: "open_app", app: "weather" });
  }

  const dur = parseDuration(n);
  if (dur && /(timer|zamanlayici|alarm|hatirlat|geri say)/.test(n)) {
    return reply(`${Math.round(dur / 60) || dur} birimlik sayacı kurdum.`, {
      type: "set_timer",
      seconds: dur,
      label: text,
    }, { type: "open_app", app: "timer" });
  }
  if (dur && /(dakika|saat).*(sonra|hatirlat)/.test(n)) {
    return reply("Kuruldu.", { type: "set_timer", seconds: dur, label: "hatırlatma" }, { type: "open_app", app: "timer" });
  }

  const note = text.match(/^(?:not al|not et|kaydet|hatırla|hatirla)\s*[:\-]?\s*(.+)/i);
  if (note?.[1]) {
    return reply("Not aldım.", { type: "add_note", text: note[1] }, { type: "open_app", app: "notes" });
  }

  const calc = text.match(/^(?:hesapla|calculate)\s+(.+)/i);
  if (calc?.[1]) {
    return reply("Hesaplıyorum.", { type: "calculate", expression: calc[1] }, { type: "open_app", app: "calc" });
  }
  if (/^[\d\s+\-*/().x×÷,]+$/.test(text) && /[+\-*/x×÷]/.test(text)) {
    return reply("Hesaplıyorum.", { type: "calculate", expression: text }, { type: "open_app", app: "calc" });
  }

  const search = text.match(/^(?:google(?:'?da| da)?|web(?:'?de| de)?|internette)\s*(?:ara|:)\s*(.+)/i);
  if (search?.[1]) {
    return reply("Arıyorum.", { type: "search_web", query: search[1] });
  }
  const yt = text.match(/youtube(?:'?da| da)?\s*(?:ara|:)\s*(.+)/i);
  if (yt?.[1]) {
    return reply("YouTube'da bakıyorum.", {
      type: "open_url",
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(yt[1])}`,
      title: "YouTube",
    });
  }

  if (/(isiklari kapat|karanlik|dim|gece modu|night mode)/.test(n)) {
    const mode = /bright|aydinlik|isiklari ac/.test(n) ? "bright" : /dim/.test(n) ? "dim" : "night";
    return reply("Ayarladım.", { type: "set_theme", mode });
  }
  if (/(isiklari ac|aydinlik|gunduz|bright)/.test(n)) {
    return reply("Aydınlatıyorum.", { type: "set_theme", mode: "bright" });
  }

  if (/^(kapat|close|pencereyi kapat)$/.test(n)) {
    return reply("Kapattım.", { type: "close_top" });
  }

  for (const [alias, app] of Object.entries(APP_ALIASES)) {
    if (new RegExp(`(^|\\s)${alias}(i|u|yi|yu)?\\s*(ac|open)|\\bopen ${alias}\\b`).test(n) || n === `${alias} ac`) {
      if (app === "music" && /(cal|play)/.test(n)) continue;
      return reply("Açıyorum.", { type: "open_app", app });
    }
  }

  if (/(ac|open)/.test(n)) {
    const site = lookupSite(n);
    if (site) {
      return reply(`${site.title} açılıyor.`, { type: "open_url", url: site.url, title: site.title });
    }
  }

  if (/^(merhaba|selam|hey jarvis|hi jarvis|hello|gunaydin|iyi aksamlar)/.test(n)) {
    return reply("Buradayım.");
  }
  if (/^(tesekkur|tesekkurler|sag ol|thanks)/.test(n)) {
    return reply("Ne demek.");
  }

  return null;
}
