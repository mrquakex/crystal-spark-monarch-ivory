import { CloudSun, KeyRound, Radio, Settings } from "lucide-react";
import { useJarvis } from "@/lib/jarvis/store";
import { weatherLabel } from "@/lib/jarvis/weather";
import { ClockLine } from "./clock";

export function StatusRail() {
  const weather = useJarvis((s) => s.weather);
  const geminiKey = useJarvis((s) => s.geminiKey);
  const nowPlaying = useJarvis((s) => s.nowPlaying);
  const playing = useJarvis((s) => s.playing);
  const startedAt = useJarvis((s) => s.startedAt);
  const minutes = Math.max(0, Math.floor((Date.now() - startedAt) / 60000));

  return (
    <aside className="hidden w-52 shrink-0 flex-col gap-6 md:flex">
      <ClockLine />
      <dl className="flex flex-col gap-3 font-mono text-[11px] tracking-[0.12em] text-muted" lang="en">
        <div className="flex items-center gap-2 uppercase">
          <span className="size-1.5 rounded-full bg-ok" />
          <span>Online</span>
        </div>
        <div className="flex items-center gap-2 uppercase">
          <KeyRound className="size-3.5" />
          <span>{geminiKey ? "Gemini" : "Grok"}</span>
        </div>
        <div className="uppercase">Uptime {minutes} min</div>
      </dl>
      {weather ? (
        <button
          type="button"
          onClick={() => useJarvis.getState().openWindow("weather")}
          className="flex items-start gap-2 text-left"
        >
          <CloudSun className="mt-0.5 size-4 text-muted" />
          <span>
            <span className="block text-sm text-fg">
              {weather.city} {weather.temp}°
            </span>
            <span className="text-xs text-muted">{weatherLabel(weather.code)}</span>
          </span>
        </button>
      ) : null}
      {nowPlaying && playing ? (
        <button
          type="button"
          onClick={() => useJarvis.getState().openWindow("music")}
          className="flex items-start gap-2 text-left"
        >
          <Radio className="mt-0.5 size-4 text-accent" />
          <span>
            <span className="block text-xs text-subtle uppercase tracking-[0.14em]">Çalıyor</span>
            <span className="text-sm text-fg">{nowPlaying.name}</span>
          </span>
        </button>
      ) : null}
    </aside>
  );
}

export function TopBar() {
  const geminiKey = useJarvis((s) => s.geminiKey);
  const openWindow = useJarvis((s) => s.openWindow);
  return (
    <div className="flex items-center justify-between gap-3 md:hidden">
      <span className="font-mono text-[11px] tracking-[0.28em] text-subtle uppercase">J.A.R.V.I.S.</span>
      <div className="flex items-center gap-1">
        <span
          className="flex items-center gap-2 font-mono text-[11px] tracking-[0.16em] text-muted uppercase"
          lang="en"
        >
          <span className="size-1.5 rounded-full bg-ok" />
          {geminiKey ? "Gemini" : "Grok"}
        </span>
        <button
          type="button"
          className="flex size-11 items-center justify-center rounded-md text-muted hover:text-fg"
          onClick={() => openWindow("settings")}
          aria-label="Ayarlar"
        >
          <Settings className="size-4" />
        </button>
      </div>
    </div>
  );
}
