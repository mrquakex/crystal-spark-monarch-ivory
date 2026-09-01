import { cn } from "@/lib/utils";
import type { Phase } from "@/lib/jarvis/types";

type Props = {
  phase: Phase;
  level?: number;
  onToggle: () => void;
};

export function Orb({ phase, level = 0, onToggle }: Props) {
  const listening = phase === "listening";
  const thinking = phase === "thinking";
  const speaking = phase === "speaking";
  const ringScale = 1 + (listening ? level * 0.12 : 0);

  const status =
    phase === "listening"
      ? "Dinliyor"
      : phase === "thinking"
        ? "Düşünüyor"
        : phase === "speaking"
          ? "Konuşuyor"
          : "Hazır";

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={listening ? "Dinlemeyi durdur" : "Konuşmaya başla"}
      className="group relative mx-auto flex size-[min(46vw,240px)] items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
    >
      <span
        className="absolute inset-[8%] rounded-full border border-line"
        style={{ transform: `scale(${ringScale})` }}
      />
      <span className="absolute inset-[16%] rounded-full border border-line/80" />
      <span
        className={cn(
          "absolute inset-[24%] rounded-full border border-accent/35",
          speaking && "orb-speak",
          !listening && !thinking && !speaking && "orb-breathe",
        )}
      />
      {thinking ? (
        <svg
          className="orb-spin absolute inset-[12%] text-accent"
          viewBox="0 0 100 100"
          aria-hidden="true"
        >
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeDasharray="40 220"
            strokeLinecap="round"
            opacity="0.9"
          />
        </svg>
      ) : null}
      <span className="relative flex flex-col items-center gap-1">
        <span className="font-mono text-xs tracking-[0.28em] text-subtle uppercase">
          J.A.R.V.I.S.
        </span>
        <span
          className={cn(
            "font-mono text-[11px] tracking-[0.22em] uppercase",
            listening || speaking ? "text-accent" : "text-muted",
          )}
        >
          {status}
        </span>
      </span>
    </button>
  );
}
