import { useEffect, useRef } from "react";
import { useJarvis } from "@/lib/jarvis/store";

export function MusicEngine() {
  const ref = useRef<HTMLAudioElement>(null);
  const nowPlaying = useJarvis((s) => s.nowPlaying);
  const playing = useJarvis((s) => s.playing);
  const volume = useJarvis((s) => s.volume);
  const muted = useJarvis((s) => s.muted);
  const setPlayBlocked = useJarvis((s) => s.setPlayBlocked);
  const setPlaying = useJarvis((s) => s.setPlaying);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!nowPlaying) {
      el.pause();
      el.removeAttribute("src");
      return;
    }
    if (el.getAttribute("src") !== nowPlaying.url) {
      el.src = nowPlaying.url;
    }
    if (playing) {
      void el
        .play()
        .then(() => setPlayBlocked(false))
        .catch(() => setPlayBlocked(true));
    } else {
      el.pause();
    }
  }, [nowPlaying, playing, setPlayBlocked]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.volume = muted ? 0 : volume / 100;
  }, [muted, volume]);

  return (
    <audio
      ref={ref}
      className="hidden"
      preload="none"
      onEnded={() => setPlaying(false)}
    />
  );
}
