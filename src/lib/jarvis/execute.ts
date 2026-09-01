import { evalMath } from "./calc";
import { enginePause, enginePlay, engineStop, engineVolume } from "./engine";
import { uid } from "./ids";
import { pickLocalStation } from "./radio";
import { ensureUrl } from "./sites";
import { useJarvis } from "./store";
import type { JarvisAction, JarvisReply } from "./types";
import { APP_META } from "./types";
import { fetchWeather, weatherLabel } from "./weather";

export async function runReply(reply: JarvisReply): Promise<string> {
  let speak = reply.speak;
  for (const action of reply.actions) {
    const extra = await runAction(action);
    if (extra) speak = extra;
  }
  return speak;
}

async function runAction(action: JarvisAction): Promise<string | null> {
  const s = useJarvis.getState();

  switch (action.type) {
    case "play_music": {
      const station = pickLocalStation(action.query);
      s.setNowPlaying(station);
      s.setPlaying(true);
      s.setMuted(false);
      s.openWindow("music");
      void enginePlay(station.url, s.volume / 100)
        .then(() => s.setPlayBlocked(false))
        .catch(() => s.setPlayBlocked(true));
      return `${station.name} çalıyor.`;
    }
    case "pause_music":
      s.setPlaying(false);
      enginePause();
      return "Durdurdum.";
    case "resume_music": {
      let station = s.nowPlaying;
      if (!station) {
        station = pickLocalStation("chill");
        s.setNowPlaying(station);
      }
      s.setPlaying(true);
      void enginePlay(station.url, (s.muted ? 0 : s.volume) / 100)
        .then(() => s.setPlayBlocked(false))
        .catch(() => s.setPlayBlocked(true));
      return "Devam.";
    }
    case "stop_music":
      s.setPlaying(false);
      s.setNowPlaying(null);
      engineStop();
      return "Müziği kapattım.";
    case "set_volume":
      s.setVolume(action.level);
      if (action.level === 0) s.setMuted(true);
      else s.setMuted(false);
      engineVolume(action.level / 100, action.level === 0);
      return `Ses ${action.level}.`;
    case "open_app":
      s.openWindow(action.app);
      return `${APP_META[action.app].title} açık.`;
    case "close_app":
      s.closeWindow(action.app);
      return "Kapattım.";
    case "close_top": {
      const closed = s.closeTopWindow();
      return closed ? "Kapattım." : "Açık panel yok.";
    }
    case "open_url": {
      const url = ensureUrl(action.url);
      s.setBrowser(url, action.title ?? "Tarayıcı");
      s.openWindow("browser");
      return `${action.title ?? "Sayfa"} açılıyor.`;
    }
    case "search_web": {
      const url = `https://duckduckgo.com/?q=${encodeURIComponent(action.query)}`;
      s.setBrowser(url, action.query);
      s.openWindow("browser");
      return "Arama açık.";
    }
    case "set_timer": {
      const seconds = Math.max(5, Math.min(24 * 3600, Math.round(action.seconds)));
      s.addTimer({
        id: uid("t"),
        label: action.label?.slice(0, 48) || "zamanlayıcı",
        seconds,
        endsAt: Date.now() + seconds * 1000,
      });
      s.openWindow("timer");
      const mins = Math.round(seconds / 60);
      return mins >= 1 ? `${mins} dakikalık sayaç kuruldu.` : `${seconds} saniyelik sayaç kuruldu.`;
    }
    case "add_note":
      if (action.text.trim()) {
        s.addNote({ id: uid("n"), text: action.text.trim(), at: Date.now() });
        s.openWindow("notes");
      }
      return "Not aldım.";
    case "weather": {
      try {
        const w = await fetchWeather(action.city);
        s.setWeather(w);
        s.openWindow("weather");
        return `${w.city}: ${w.temp}°, ${weatherLabel(w.code)}.`;
      } catch {
        return "Havayı alamadım.";
      }
    }
    case "set_theme":
      s.setTheme(action.mode);
      return "Tema güncellendi.";
    case "calculate": {
      try {
        const result = evalMath(action.expression);
        s.setCalcValue(result);
        s.openWindow("calc");
        return `Sonuç ${result}.`;
      } catch {
        return "Bunu hesaplayamadım.";
      }
    }
    default:
      return null;
  }
}
