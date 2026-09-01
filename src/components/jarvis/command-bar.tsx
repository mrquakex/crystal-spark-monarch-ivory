import { Mic, MicOff, Send } from "lucide-react";
import { useEffect, useRef, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { canListen } from "@/lib/jarvis/speech";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSubmit: (v: string) => void;
  listening: boolean;
  busy: boolean;
  onMic: () => void;
};

export function CommandBar({ value, onChange, onSubmit, listening, busy, onMic }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const listenOk = canListen();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        ref.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handle = (e: FormEvent) => {
    e.preventDefault();
    const t = value.trim();
    if (!t || busy) return;
    onSubmit(t);
  };

  return (
    <form
      onSubmit={handle}
      className="flex items-center gap-2 rounded-xl border border-line bg-surface p-1.5"
    >
      <Button
        variant="quiet"
        size="icon"
        onClick={onMic}
        disabled={!listenOk}
        aria-pressed={listening}
        aria-label={listening ? "Mikrofonu kapat" : "Mikrofon"}
        className={cn(listening && "text-accent")}
      >
        {listenOk ? (
          listening ? (
            <Mic className="size-5" />
          ) : (
            <Mic className="size-5" />
          )
        ) : (
          <MicOff className="size-5" />
        )}
      </Button>
      <input
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Komut yaz veya konuş — müzik çal, youtube aç"
        disabled={busy}
        className="h-11 min-w-0 flex-1 bg-transparent px-1 text-sm text-fg placeholder:text-subtle focus:outline-none"
      />
      <Button type="submit" variant="accent" size="icon" disabled={busy || !value.trim()} aria-label="Gönder">
        <Send className="size-4" />
      </Button>
    </form>
  );
}
