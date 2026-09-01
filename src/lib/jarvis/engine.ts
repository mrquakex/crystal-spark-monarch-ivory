let node: HTMLAudioElement | null = null;

export function attachEngine(el: HTMLAudioElement | null) {
  node = el;
}

export function enginePlay(url: string, volume: number): Promise<void> {
  if (!node) return Promise.reject(new Error("no-audio"));
  if (node.getAttribute("src") !== url) node.src = url;
  node.volume = Math.max(0, Math.min(1, volume));
  return node.play();
}

export function enginePause() {
  node?.pause();
}

export function engineStop() {
  if (!node) return;
  node.pause();
  node.removeAttribute("src");
  node.load();
}

export function engineVolume(volume: number, muted: boolean) {
  if (!node) return;
  node.volume = muted ? 0 : Math.max(0, Math.min(1, volume));
}
