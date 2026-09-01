const CHIPS = ["Müzik çal", "Saat kaç", "Hava durumu", "YouTube aç", "5 dakika timer"];

export function SuggestionChips({ onPick }: { onPick: (t: string) => void }) {
  return (
    <div className="flex flex-wrap justify-center gap-1.5">
      {CHIPS.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onPick(c)}
          className="h-9 rounded-full border border-line px-3 text-xs text-muted hover:bg-elevated hover:text-fg"
        >
          {c}
        </button>
      ))}
    </div>
  );
}
