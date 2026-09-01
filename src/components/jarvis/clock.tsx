import { useEffect, useState } from "react";

export function useNow(ms = 1000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}

export function ClockLine() {
  const now = useNow();
  const time = new Intl.DateTimeFormat("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(now);
  const date = new Intl.DateTimeFormat("tr-TR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(now);
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-2xl tracking-tight tabular-nums text-fg">{time}</span>
      <span className="font-mono text-[11px] tracking-[0.18em] text-muted uppercase">
        {date}
      </span>
    </div>
  );
}
