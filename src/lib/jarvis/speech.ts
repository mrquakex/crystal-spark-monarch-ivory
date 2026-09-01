export type Recog = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((ev: RecogEvent) => void) | null;
  onerror: ((ev: { error: string }) => void) | null;
  onend: (() => void) | null;
};

export type RecogEvent = {
  resultIndex: number;
  results: Array<{ isFinal: boolean; 0: { transcript: string } }>;
};

type RecogCtor = new () => Recog;

export function getRecogCtor(): RecogCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: RecogCtor;
    webkitSpeechRecognition?: RecogCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function canListen(): boolean {
  return getRecogCtor() !== null;
}

function pickVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  const tr = voices.find((v) => v.lang.toLowerCase().startsWith("tr"));
  if (tr) return tr;
  const en = voices.find((v) => /en[-_]/i.test(v.lang) && /google|premium|natural/i.test(v.name));
  return en ?? voices[0] ?? null;
}

export function speakText(text: string, onEnd?: () => void): void {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    onEnd?.();
    return;
  }
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const voice = pickVoice();
  if (voice) u.voice = voice;
  u.lang = voice?.lang ?? "tr-TR";
  u.rate = 1.02;
  u.pitch = 0.88;
  u.volume = 1;
  u.onend = () => onEnd?.();
  u.onerror = () => onEnd?.();
  window.speechSynthesis.speak(u);
}

export function silence(): void {
  if (typeof window === "undefined") return;
  window.speechSynthesis?.cancel();
}

export function warmVoices(): void {
  if (typeof window === "undefined") return;
  window.speechSynthesis?.getVoices();
  window.speechSynthesis?.addEventListener("voiceschanged", () => {
    window.speechSynthesis.getVoices();
  });
}
