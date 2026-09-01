import type { ReactNode } from "react";
import { Settings, ScrollText, X } from "lucide-react";
import { APP_META, type AppId } from "@/lib/jarvis/types";
import { useJarvis } from "@/lib/jarvis/store";
import { cn } from "@/lib/utils";
import { AppPanel } from "./panels";

export function WindowLayer() {
  const windows = useJarvis((s) => s.windows);
  const closeWindow = useJarvis((s) => s.closeWindow);
  const focusWindow = useJarvis((s) => s.focusWindow);
  const openWindow = useJarvis((s) => s.openWindow);

  return (
    <>
      <div className="pointer-events-none absolute top-4 right-4 z-30 hidden gap-1 md:flex">
        <IconBtn label="Günlük" onClick={() => openWindow("log")}>
          <ScrollText className="size-4" />
        </IconBtn>
        <IconBtn label="Ayarlar" onClick={() => openWindow("settings")}>
          <Settings className="size-4" />
        </IconBtn>
      </div>

      {windows.map((w) => (
        <HudWindow
          key={w.id}
          id={w.id}
          x={w.x}
          y={w.y}
          z={w.z}
          onClose={() => closeWindow(w.id)}
          onFocus={() => focusWindow(w.id)}
        />
      ))}
    </>
  );
}

function IconBtn({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      className="pointer-events-auto flex size-11 items-center justify-center rounded-md border border-line bg-surface text-muted hover:text-fg"
    >
      {children}
      <span className="sr-only">{label}</span>
    </button>
  );
}

function HudWindow({
  id,
  x,
  y,
  z,
  onClose,
  onFocus,
}: {
  id: AppId;
  x: number;
  y: number;
  z: number;
  onClose: () => void;
  onFocus: () => void;
}) {
  const meta = APP_META[id];
  return (
    <section
      role="dialog"
      aria-label={meta.title}
      onPointerDown={onFocus}
      style={{ zIndex: 20 + z, top: y, left: x }}
      className={cn(
        "fixed flex max-h-[min(78vh,640px)] w-[min(92vw,420px)] flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-[0_24px_60px_rgba(0,0,0,0.45)]",
        "max-md:!inset-x-3 max-md:!top-16 max-md:!bottom-36 max-md:!w-auto max-md:!max-h-none",
      )}
    >
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-line px-3">
        <div>
          <p className="text-sm font-medium">{meta.title}</p>
          <p className="font-mono text-[10px] tracking-[0.14em] text-subtle uppercase">{meta.hint}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex size-11 items-center justify-center rounded-md text-muted hover:text-fg"
          aria-label="Kapat"
        >
          <X className="size-4" />
        </button>
      </header>
      <div className="min-h-0 flex-1 overflow-auto p-4">
        <AppPanel id={id} />
      </div>
    </section>
  );
}
