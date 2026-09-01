import { useCallback, useEffect, useRef, useState } from "react";
import { interpret } from "@/lib/jarvis/ask";
import { runReply } from "@/lib/jarvis/execute";
import { uid } from "@/lib/jarvis/ids";
import { getRecogCtor, silence, speakText, warmVoices, type Recog } from "@/lib/jarvis/speech";
import { useJarvis } from "@/lib/jarvis/store";
import { fetchWeather } from "@/lib/jarvis/weather";
import { cn } from "@/lib/utils";
import { CommandBar } from "./command-bar";
import { Corners } from "./corners";
import { Dock } from "./dock";
import { MusicEngine } from "./music-engine";
import { Orb } from "./orb";
import { SuggestionChips } from "./chips";
import { StatusRail, TopBar } from "./status-rail";
import { WindowLayer } from "./windows";

export function JarvisApp() {
  const phase = useJarvis((s) => s.phase);
  const booted = useJarvis((s) => s.booted);
  const hydrated = useJarvis((s) => s.hydrated);
  const lastHeard = useJarvis((s) => s.lastHeard);
  const lastSpoke = useJarvis((s) => s.lastSpoke);
  const theme = useJarvis((s) => s.theme);
  const error = useJarvis((s) => s.error);
  const voiceEnabled = useJarvis((s) => s.voiceEnabled);
  const [draft, setDraft] = useState("");
  const recogRef = useRef<Recog | null>(null);
  const listeningRef = useRef(false);

  useEffect(() => {
    const t = window.setTimeout(() => {
      if (!useJarvis.getState().hydrated) useJarvis.getState().setHydrated();
    }, 80);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!hydrated || booted) return;
    const t = window.setTimeout(() => {
      useJarvis.getState().finishBoot();
      useJarvis.getState().setLastSpoke("Sistemler çevrimiçi. Dinliyorum.");
    }, 1100);
    return () => window.clearTimeout(t);
  }, [hydrated, booted]);

  useEffect(() => {
    warmVoices();
    void fetchWeather()
      .then((w) => useJarvis.getState().setWeather(w))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      const { timers, removeTimer } = useJarvis.getState();
      const due = timers.filter((t) => t.endsAt <= Date.now());
      if (!due.length) return;
      for (const t of due) removeTimer(t.id);
      const line = due.length === 1 ? `${due[0]?.label ?? "Sayaç"} doldu.` : "Sayaçlar doldu.";
      useJarvis.getState().setLastSpoke(line);
      if (useJarvis.getState().voiceEnabled) speakText(line);
    }, 400);
    return () => window.clearInterval(id);
  }, []);

  const speakOut = useCallback(
    (text: string) => {
      useJarvis.getState().setLastSpoke(text);
      if (!voiceEnabled) {
        useJarvis.getState().setPhase("idle");
        return;
      }
      useJarvis.getState().setPhase("speaking");
      speakText(text, () => {
        if (useJarvis.getState().phase === "speaking") {
          useJarvis.getState().setPhase("idle");
        }
      });
    },
    [voiceEnabled],
  );

  const handleUtterance = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      silence();
      const store = useJarvis.getState();
      store.setError(null);
      store.setLastHeard(trimmed);
      store.pushMessage({ id: uid("u"), role: "user", text: trimmed, at: Date.now() });
      store.setPhase("thinking");
      try {
        const reply = await interpret(trimmed);
        const spoken = await runReply(reply);
        store.pushMessage({ id: uid("j"), role: "jarvis", text: spoken, at: Date.now() });
        speakOut(spoken);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Bir şey ters gitti.";
        store.setError(msg);
        speakOut("Bunu şu an yapamadım.");
      }
    },
    [speakOut],
  );

  const stopListen = useCallback(() => {
    listeningRef.current = false;
    recogRef.current?.stop();
    if (useJarvis.getState().phase === "listening") {
      useJarvis.getState().setPhase("idle");
    }
  }, []);

  const startListen = useCallback(() => {
    const Ctor = getRecogCtor();
    if (!Ctor) {
      useJarvis.getState().setError("Bu tarayıcı ses tanımayı desteklemiyor. Yazarak komut ver.");
      return;
    }
    silence();
    const recog = new Ctor();
    recog.lang = "tr-TR";
    recog.continuous = false;
    recog.interimResults = true;
    recog.onresult = (ev) => {
      let finalText = "";
      let interim = "";
      for (let i = ev.resultIndex; i < ev.results.length; i += 1) {
        const row = ev.results[i];
        if (!row) continue;
        if (row.isFinal) finalText += row[0].transcript;
        else interim += row[0].transcript;
      }
      if (interim) useJarvis.getState().setLastHeard(interim);
      if (finalText.trim()) {
        listeningRef.current = false;
        void handleUtterance(finalText);
      }
    };
    recog.onerror = (ev) => {
      if (ev.error === "not-allowed") {
        useJarvis.getState().setError("Mikrofon izni gerekli. Yazarak da komut verebilirsin.");
      }
      stopListen();
    };
    recog.onend = () => {
      if (listeningRef.current) {
        try {
          recog.start();
        } catch {
          stopListen();
        }
      } else if (useJarvis.getState().phase === "listening") {
        useJarvis.getState().setPhase("idle");
      }
    };
    recogRef.current = recog;
    listeningRef.current = true;
    useJarvis.getState().setPhase("listening");
    try {
      recog.start();
    } catch {
      useJarvis.getState().setError("Mikrofon başlatılamadı.");
      stopListen();
    }
  }, [handleUtterance, stopListen]);

  const toggleListen = useCallback(() => {
    if (useJarvis.getState().phase === "listening") stopListen();
    else startListen();
  }, [startListen, stopListen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        useJarvis.getState().closeTopWindow();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const busy = phase === "thinking" || phase === "speaking";

  return (
    <main
      data-theme={theme}
      className="relative min-h-dvh overflow-hidden bg-bg text-fg"
    >
      <div className="hud-grid pointer-events-none absolute inset-0 opacity-70" />
      <div className="hud-vignette pointer-events-none absolute inset-0" />
      <Corners />
      <MusicEngine />

      {!booted ? (
        <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center gap-3">
          <p className="stagger-in font-mono text-xs tracking-[0.42em] text-subtle uppercase">
            J.A.R.V.I.S.
          </p>
          <p
            className="stagger-in font-mono text-[11px] tracking-[0.24em] text-muted uppercase"
            style={{ animationDelay: "120ms" }}
          >
            Sistem başlatılıyor
          </p>
          <span
            className="stagger-in mt-4 h-px w-32 overflow-hidden bg-line"
            style={{ animationDelay: "180ms" }}
          >
            <span className="shimmer block h-full w-full" />
          </span>
        </div>
      ) : (
        <div className="relative z-10 mx-auto flex min-h-dvh max-w-6xl flex-col gap-6 px-4 py-5 md:px-8 md:py-8">
          <TopBar />
          <div className="flex flex-1 items-stretch gap-8">
            <StatusRail />
            <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-6">
              <Orb
                phase={phase}
                onToggle={toggleListen}
              />
              <div className="flex min-h-20 max-w-lg flex-col items-center gap-2 text-center">
                {lastHeard ? (
                  <p className="text-xs text-subtle">{lastHeard}</p>
                ) : null}
                <p
                  className={cn(
                    "text-lg font-medium leading-snug text-fg md:text-xl",
                    phase === "thinking" && "text-muted",
                  )}
                >
                  {phase === "thinking" ? "Düşünüyorum…" : lastSpoke || "Komutunu bekliyorum."}
                </p>
                {error ? <p className="text-sm text-danger">{error}</p> : null}
              </div>
              <SuggestionChips
                onPick={(t) => {
                  setDraft("");
                  void handleUtterance(t);
                }}
              />
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex justify-center">
              <Dock />
            </div>
            <CommandBar
              value={draft}
              onChange={setDraft}
              onSubmit={(v) => {
                setDraft("");
                void handleUtterance(v);
              }}
              listening={phase === "listening"}
              busy={busy}
              onMic={toggleListen}
            />
          </div>
        </div>
      )}

      {booted ? <WindowLayer /> : null}
    </main>
  );
}
