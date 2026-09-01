import type { Station } from "./types";

export const CATALOG: Station[] = [
  { name: "Groove Salad", url: "https://ice4.somafm.com/groovesalad-128-mp3", tags: "ambient lounge chill lofi sakin" },
  { name: "Drone Zone", url: "https://ice4.somafm.com/dronezone-128-mp3", tags: "ambient drone atmospheric" },
  { name: "Lush", url: "https://ice4.somafm.com/lush-128-mp3", tags: "mellow female vocal" },
  { name: "Beat Blender", url: "https://ice4.somafm.com/beatblender-128-mp3", tags: "downtempo electronic lofi chill" },
  { name: "Space Station", url: "https://ice4.somafm.com/spacestation-128-mp3", tags: "electronic space ambient" },
  { name: "Secret Agent", url: "https://ice4.somafm.com/secretagent-128-mp3", tags: "lounge spy jazz" },
  { name: "Sonic Universe", url: "https://ice4.somafm.com/sonicuniverse-128-mp3", tags: "jazz avant" },
  { name: "Indie Pop Rocks", url: "https://ice4.somafm.com/indiepop-128-mp3", tags: "indie pop rock" },
  { name: "The Trip", url: "https://ice4.somafm.com/thetrip-128-mp3", tags: "house trance dance elektronik" },
  { name: "Digitalis", url: "https://ice4.somafm.com/digitalis-128-mp3", tags: "shoegaze indie electronic" },
  { name: "DEF CON Radio", url: "https://ice4.somafm.com/defcon-128-mp3", tags: "electronic hype" },
  { name: "Boot Liquor", url: "https://ice4.somafm.com/bootliquor-128-mp3", tags: "americana country folk" },
];

const GENRE_HINT: Record<string, string> = {
  lofi: "Beat Blender",
  chill: "Groove Salad",
  sakin: "Groove Salad",
  rahat: "Lush",
  jazz: "Sonic Universe",
  ambient: "Drone Zone",
  elektronik: "The Trip",
  electronic: "The Trip",
  dance: "The Trip",
  rock: "Indie Pop Rocks",
  indie: "Indie Pop Rocks",
  pop: "Indie Pop Rocks",
  space: "Space Station",
  uzay: "Space Station",
};

function score(station: Station, q: string): number {
  const hay = `${station.name} ${station.tags}`.toLowerCase();
  if (hay.includes(q)) return q.length + (station.name.toLowerCase().includes(q) ? 8 : 0);
  return q.split(/\s+/).reduce((n, w) => n + (w.length > 2 && hay.includes(w) ? w.length : 0), 0);
}

export function pickLocalStation(query: string): Station {
  const q = query.trim().toLowerCase();
  if (!q || q === "muzik" || q === "müzik" || q === "music" || q === "radyo") {
    return CATALOG[0]!;
  }
  const hint = Object.entries(GENRE_HINT).find(([k]) => q.includes(k));
  if (hint) {
    const named = CATALOG.find((s) => s.name === hint[1]);
    if (named) return named;
  }
  const local = [...CATALOG].sort((a, b) => score(b, q) - score(a, q))[0];
  return local ?? CATALOG[0]!;
}

export async function findStation(query: string): Promise<Station> {
  const local = pickLocalStation(query);
  const q = query.trim().toLowerCase();
  if (!q || q === "muzik" || q === "müzik" || q === "music" || q === "radyo") {
    return local;
  }
  const hint = Object.entries(GENRE_HINT).find(([k]) => q.includes(k));
  if (hint) return local;
  if (score(local, q) >= 3) return local;

  try {
    const url =
      "https://de1.api.radio-browser.info/json/stations/search?" +
      new URLSearchParams({
        name: query,
        hidebroken: "true",
        limit: "8",
        order: "clickcount",
        reverse: "true",
      }).toString();
    const res = await fetch(url, { headers: { "User-Agent": "JARVIS/1.0" } });
    if (res.ok) {
      const rows = (await res.json()) as {
        name: string;
        url_resolved?: string;
        url?: string;
        tags?: string;
        bitrate?: number;
      }[];
      const hit = rows.find((r) => r.url_resolved || r.url);
      if (hit) {
        return {
          name: hit.name,
          url: hit.url_resolved || hit.url || "",
          tags: hit.tags ?? "",
          bitrate: hit.bitrate,
        };
      }
    }
  } catch {
    /* catalog fallback */
  }

  return local;
}
