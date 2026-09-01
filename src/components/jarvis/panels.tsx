import {
  ExternalLink,
  Pause,
  Play,
  Plus,
  Trash2,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { evalMath } from "@/lib/jarvis/calc";
import { uid } from "@/lib/jarvis/ids";
import { CATALOG } from "@/lib/jarvis/radio";
import { ensureUrl } from "@/lib/jarvis/sites";
import { useJarvis } from "@/lib/jarvis/store";
import { probeGemini } from "@/lib/jarvis/gemini";
import { weatherLabel } from "@/lib/jarvis/weather";
import { cn } from "@/lib/utils";
import type { AppId } from "@/lib/jarvis/types";
import { useNow } from "./clock";

export function AppPanel({ id }: { id: AppId }) {
  switch (id) {
    case "music":
      return <MusicPanel />;
    case "weather":
      return <WeatherPanel />;
    case "notes":
      return <NotesPanel />;
    case "browser":
      return <BrowserPanel />;
    case "timer":
      return <TimerPanel />;
    case "calc":
      return <CalcPanel />;
    case "maps":
      return <MapsPanel />;
    case "feed":
      return <FeedPanel />;
    case "settings":
      return <SettingsPanel />;
    case "log":
      return <LogPanel />;
    default:
      return null;
  }
}

function MusicPanel() {
  const nowPlaying = useJarvis((s) => s.nowPlaying);
  const playing = useJarvis((s) => s.playing);
  const volume = useJarvis((s) => s.volume);
  const muted = useJarvis((s) => s.muted);
  const playBlocked = useJarvis((s) => s.playBlocked);
  const setNowPlaying = useJarvis((s) => s.setNowPlaying);
  const setPlaying = useJarvis((s) => s.setPlaying);
  const setVolume = useJarvis((s) => s.setVolume);
  const setMuted = useJarvis((s) => s.setMuted);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="font-mono text-[11px] tracking-[0.18em] text-subtle uppercase">Şimdi</p>
        <p className="mt-1 text-lg font-medium">{nowPlaying?.name ?? "Sessiz"}</p>
        <p className="text-sm text-muted">{nowPlaying?.tags || "Bir istasyon seç"}</p>
      </div>
      {playBlocked && playing ? (
        <Button
          variant="accent"
          onClick={() => {
            setPlaying(true);
          }}
        >
          Çalmak için dokun
        </Button>
      ) : null}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            if (!nowPlaying) {
              setNowPlaying(CATALOG[0]!);
            }
            setPlaying(!playing);
          }}
          aria-label={playing ? "Duraklat" : "Çal"}
        >
          {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
        </Button>
        <button
          type="button"
          className="text-muted"
          onClick={() => setMuted(!muted)}
          aria-label="Ses"
        >
          {muted || volume === 0 ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
        </button>
        <input
          type="range"
          min={0}
          max={100}
          value={muted ? 0 : volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="h-11 flex-1 accent-accent"
        />
      </div>
      <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
        {CATALOG.map((st) => (
          <li key={st.name}>
            <button
              type="button"
              onClick={() => {
                setNowPlaying(st);
                setPlaying(true);
              }}
              className={cn(
                "w-full rounded-md border border-line px-3 py-2.5 text-left text-sm hover:bg-elevated",
                nowPlaying?.name === st.name && "border-accent/40 bg-elevated",
              )}
            >
              {st.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function WeatherPanel() {
  const weather = useJarvis((s) => s.weather);
  if (!weather) {
    return <p className="text-sm text-muted">“Hava durumu” de, bakayım.</p>;
  }
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="font-mono text-[11px] tracking-[0.18em] text-subtle uppercase">{weather.city}</p>
        <p className="mt-1 text-4xl font-medium tracking-tight tabular-nums">{weather.temp}°</p>
        <p className="text-sm text-muted">{weatherLabel(weather.code)}</p>
      </div>
      <p className="text-sm text-muted">
        Rüzgar {weather.wind} km/s · nem %{weather.humidity}
      </p>
      <ul className="grid grid-cols-5 gap-2">
        {weather.daily.map((d) => (
          <li key={d.date} className="rounded-md border border-line bg-elevated px-1 py-2 text-center">
            <p className="font-mono text-[10px] text-subtle uppercase">
              {new Intl.DateTimeFormat("tr-TR", { weekday: "short" }).format(new Date(d.date))}
            </p>
            <p className="mt-1 text-sm tabular-nums">
              {d.max}°
            </p>
            <p className="text-xs text-muted tabular-nums">{d.min}°</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function NotesPanel() {
  const notes = useJarvis((s) => s.notes);
  const addNote = useJarvis((s) => s.addNote);
  const removeNote = useJarvis((s) => s.removeNote);
  const [draft, setDraft] = useState("");

  return (
    <div className="flex flex-col gap-3">
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!draft.trim()) return;
          addNote({ id: uid("n"), text: draft.trim(), at: Date.now() });
          setDraft("");
        }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Not yaz"
          className="h-11 flex-1 rounded-md border border-line bg-elevated px-3 text-sm text-fg placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
        <Button type="submit" variant="ghost" size="icon" aria-label="Ekle">
          <Plus className="size-4" />
        </Button>
      </form>
      <ul className="flex max-h-64 flex-col gap-2 overflow-auto">
        {notes.length === 0 ? (
          <li className="text-sm text-muted">Henüz not yok.</li>
        ) : (
          notes.map((n) => (
            <li
              key={n.id}
              className="flex items-start justify-between gap-2 rounded-md border border-line bg-elevated px-3 py-2"
            >
              <p className="text-sm leading-snug">{n.text}</p>
              <button
                type="button"
                className="text-subtle hover:text-fg"
                onClick={() => removeNote(n.id)}
                aria-label="Sil"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

function BrowserPanel() {
  const url = useJarvis((s) => s.browserUrl);
  const title = useJarvis((s) => s.browserTitle);
  const setBrowser = useJarvis((s) => s.setBrowser);
  const [draft, setDraft] = useState(url);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    setDraft(url);
    setBlocked(false);
  }, [url]);

  return (
    <div className="flex h-full min-h-64 flex-col gap-2">
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const next = ensureUrl(draft);
          setBrowser(next, title);
        }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="h-11 flex-1 rounded-md border border-line bg-elevated px-3 font-mono text-xs text-fg focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex size-11 items-center justify-center rounded-md border border-line text-muted hover:text-fg"
          aria-label="Yeni sekmede aç"
        >
          <ExternalLink className="size-4" />
        </a>
      </form>
      <div className="relative min-h-52 flex-1 overflow-hidden rounded-md border border-line bg-elevated">
        {blocked ? (
          <div className="flex h-full flex-col items-start justify-center gap-3 p-4">
            <p className="text-sm text-muted">
              Bu site çerçeve içinde açılmıyor. Yeni sekmede aç.
            </p>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center rounded-md bg-fg px-4 text-sm font-medium text-bg"
            >
              {title} — aç
            </a>
          </div>
        ) : (
          <iframe
            title={title}
            src={url}
            className="h-full min-h-52 w-full bg-elevated"
            onLoad={() => {
              /* many hosts send XFO; we still show a fallback link */
            }}
            onError={() => setBlocked(true)}
          />
        )}
      </div>
      <button
        type="button"
        className="self-start text-xs text-muted underline-offset-2 hover:text-fg hover:underline"
        onClick={() => setBlocked(true)}
      >
        Çerçeve boşsa buraya dokun
      </button>
    </div>
  );
}

function TimerPanel() {
  const timers = useJarvis((s) => s.timers);
  const addTimer = useJarvis((s) => s.addTimer);
  const removeTimer = useJarvis((s) => s.removeTimer);
  const now = useNow(250);
  const [mins, setMins] = useState("5");

  return (
    <div className="flex flex-col gap-4">
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const seconds = Math.max(5, Number(mins) * 60);
          addTimer({
            id: uid("t"),
            label: `${mins} dk`,
            seconds,
            endsAt: Date.now() + seconds * 1000,
          });
        }}
      >
        <input
          value={mins}
          onChange={(e) => setMins(e.target.value)}
          inputMode="numeric"
          className="h-11 w-24 rounded-md border border-line bg-elevated px-3 font-mono text-sm tabular-nums focus:outline-none"
        />
        <Button type="submit" variant="ghost">
          Kur
        </Button>
      </form>
      <ul className="flex flex-col gap-2">
        {timers.length === 0 ? (
          <li className="text-sm text-muted">Aktif sayaç yok.</li>
        ) : (
          timers.map((t) => {
            const left = Math.max(0, Math.ceil((t.endsAt - now.getTime()) / 1000));
            const mm = String(Math.floor(left / 60)).padStart(2, "0");
            const ss = String(left % 60).padStart(2, "0");
            return (
              <li
                key={t.id}
                className="flex items-center justify-between rounded-md border border-line bg-elevated px-3 py-2"
              >
                <div>
                  <p className="font-mono text-lg tabular-nums">
                    {mm}:{ss}
                  </p>
                  <p className="text-xs text-muted">{t.label}</p>
                </div>
                <button type="button" onClick={() => removeTimer(t.id)} className="text-subtle hover:text-fg">
                  <Trash2 className="size-4" />
                </button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}

const KEYS = ["7", "8", "9", "/", "4", "5", "6", "*", "1", "2", "3", "-", "0", ".", "=", "+"];

function CalcPanel() {
  const value = useJarvis((s) => s.calcValue);
  const setCalcValue = useJarvis((s) => s.setCalcValue);
  const [expr, setExpr] = useState(value === "0" ? "" : value);

  const press = (k: string) => {
    if (k === "=") {
      try {
        const r = evalMath(expr || value);
        setCalcValue(r);
        setExpr(r);
      } catch {
        setCalcValue("—");
      }
      return;
    }
    const next = (expr === "0" ? "" : expr) + k;
    setExpr(next);
    setCalcValue(next);
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="rounded-md border border-line bg-elevated px-3 py-3 text-right font-mono text-2xl tabular-nums">
        {value}
      </p>
      <div className="grid grid-cols-4 gap-1.5">
        <button
          type="button"
          className="col-span-2 h-11 rounded-md border border-line text-sm text-muted hover:bg-elevated"
          onClick={() => {
            setExpr("");
            setCalcValue("0");
          }}
        >
          C
        </button>
        {KEYS.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => press(k)}
            className="h-11 rounded-md border border-line text-sm hover:bg-elevated"
          >
            {k}
          </button>
        ))}
      </div>
    </div>
  );
}

function MapsPanel() {
  const query = useJarvis((s) => s.mapQuery);
  const setMapQuery = useJarvis((s) => s.setMapQuery);
  const [draft, setDraft] = useState(query);
  const src = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=11&output=embed`;

  return (
    <div className="flex min-h-64 flex-col gap-2">
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (draft.trim()) setMapQuery(draft.trim());
        }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Şehir veya adres"
          className="h-11 flex-1 rounded-md border border-line bg-elevated px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
        <Button type="submit" variant="ghost">
          Git
        </Button>
      </form>
      <iframe title="Harita" src={src} className="min-h-52 flex-1 rounded-md border border-line" />
    </div>
  );
}

type Story = { title: string; url: string };

function FeedPanel() {
  const [stories, setStories] = useState<Story[] | null>(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    let live = true;
    fetch("https://hn.algolia.com/api/v1/search?tags=front_page")
      .then((r) => r.json())
      .then((body: { hits?: { title?: string; url?: string; objectID: string }[] }) => {
        if (!live) return;
        setStories(
          (body.hits ?? [])
            .filter((h) => h.title)
            .slice(0, 10)
            .map((h) => ({
              title: h.title!,
              url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
            })),
        );
      })
      .catch(() => {
        if (live) setErr(true);
      });
    return () => {
      live = false;
    };
  }, []);

  if (err) return <p className="text-sm text-muted">Akış alınamadı.</p>;
  if (!stories) return <p className="text-sm text-muted">Yükleniyor…</p>;

  return (
    <ul className="flex flex-col gap-2">
      {stories.map((s) => (
        <li key={s.url}>
          <a
            href={s.url}
            target="_blank"
            rel="noreferrer"
            className="block rounded-md border border-line bg-elevated px-3 py-2 text-sm leading-snug hover:border-accent/40"
          >
            {s.title}
          </a>
        </li>
      ))}
    </ul>
  );
}

function SettingsPanel() {
  const geminiKey = useJarvis((s) => s.geminiKey);
  const setGeminiKey = useJarvis((s) => s.setGeminiKey);
  const voiceEnabled = useJarvis((s) => s.voiceEnabled);
  const setVoiceEnabled = useJarvis((s) => s.setVoiceEnabled);
  const theme = useJarvis((s) => s.theme);
  const setTheme = useJarvis((s) => s.setTheme);
  const [draft, setDraft] = useState(geminiKey);
  const [status, setStatus] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-5 text-sm">
      <div className="flex flex-col gap-2">
        <p className="font-mono text-[11px] tracking-[0.18em] text-subtle uppercase">
          Google AI Studio
        </p>
        <p className="text-muted leading-relaxed">
          Gemini anahtarını yapıştır. Boş bırakırsan Grok devreye girer. Anahtar yalnızca bu tarayıcıda durur.
        </p>
        <input
          type="password"
          autoComplete="off"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="AIza…"
          className="h-11 rounded-md border border-line bg-elevated px-3 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
        <div className="flex gap-2">
          <Button
            variant="accent"
            onClick={async () => {
              const key = draft.trim();
              setGeminiKey(key);
              if (!key) {
                setStatus("Anahtar silindi. Grok kullanılacak.");
                return;
              }
              setStatus("Kontrol ediliyor…");
              const ok = await probeGemini(key);
              setStatus(ok ? "Gemini bağlı." : "Anahtar reddedildi. Yine de kaydedildi.");
            }}
          >
            Kaydet
          </Button>
          {status ? <span className="self-center text-muted">{status}</span> : null}
        </div>
      </div>
      <label className="flex items-center justify-between gap-3">
        <span>Sesli yanıt</span>
        <input
          type="checkbox"
          checked={voiceEnabled}
          onChange={(e) => setVoiceEnabled(e.target.checked)}
          className="size-4 accent-accent"
        />
      </label>
      <div className="flex flex-col gap-2">
        <p className="text-muted">Tema</p>
        <div className="flex gap-1">
          {(["night", "dim", "bright"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setTheme(m)}
              className={cn(
                "h-11 flex-1 rounded-md border border-line text-xs uppercase tracking-[0.14em]",
                theme === m && "bg-elevated text-fg",
                theme !== m && "text-muted",
              )}
            >
              {m === "night" ? "Gece" : m === "dim" ? "Loş" : "Açık"}
            </button>
          ))}
        </div>
      </div>
      <p className="text-xs leading-relaxed text-subtle">
        JARVIS tarayıcıda çalışır: müzik, siteler, not, hava, zamanlayıcı, harita. Bilgisayarındaki masaüstü
        programlarını açamaz — tarayıcı güvenliği buna izin vermez.
      </p>
    </div>
  );
}

function LogPanel() {
  const messages = useJarvis((s) => s.messages);
  const reversed = useMemo(() => [...messages].reverse(), [messages]);
  if (!reversed.length) return <p className="text-sm text-muted">Konuşma yok.</p>;
  return (
    <ul className="flex max-h-80 flex-col gap-3 overflow-auto">
      {reversed.map((m) => (
        <li key={m.id}>
          <p className="font-mono text-[10px] tracking-[0.16em] text-subtle uppercase">
            {m.role === "user" ? "Sen" : "Jarvis"}
          </p>
          <p className="text-sm leading-relaxed">{m.text}</p>
        </li>
      ))}
    </ul>
  );
}
