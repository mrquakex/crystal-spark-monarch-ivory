import {
  Calculator,
  CloudSun,
  Globe,
  Map,
  Newspaper,
  Radio,
  StickyNote,
  Timer,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { APP_META, type AppId } from "@/lib/jarvis/types";
import { useJarvis } from "@/lib/jarvis/store";
import { cn } from "@/lib/utils";

const ICONS: { id: AppId; icon: LucideIcon }[] = [
  { id: "music", icon: Radio },
  { id: "weather", icon: CloudSun },
  { id: "notes", icon: StickyNote },
  { id: "browser", icon: Globe },
  { id: "timer", icon: Timer },
  { id: "calc", icon: Calculator },
  { id: "maps", icon: Map },
  { id: "feed", icon: Newspaper },
];

export function Dock() {
  const openWindow = useJarvis((s) => s.openWindow);
  const windows = useJarvis((s) => s.windows);

  return (
    <nav
      aria-label="Uygulamalar"
      className="flex flex-wrap items-center justify-center gap-1 rounded-xl border border-line bg-surface/90 p-1.5"
    >
      {ICONS.map(({ id, icon: Icon }) => {
        const active = windows.some((w) => w.id === id);
        return (
          <button
            key={id}
            type="button"
            title={APP_META[id].title}
            onClick={() => openWindow(id)}
            className={cn(
              "flex size-11 items-center justify-center rounded-md text-muted transition-colors duration-150 hover:bg-elevated hover:text-fg",
              active && "bg-elevated text-fg",
            )}
          >
            <Icon className="size-5" strokeWidth={1.6} />
            <span className="sr-only">{APP_META[id].title}</span>
          </button>
        );
      })}
    </nav>
  );
}
