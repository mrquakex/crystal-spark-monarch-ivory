export type Site = { url: string; title: string };

const SITES: Record<string, Site> = {
  youtube: { url: "https://www.youtube.com", title: "YouTube" },
  spotify: { url: "https://open.spotify.com", title: "Spotify" },
  gmail: { url: "https://mail.google.com", title: "Gmail" },
  google: { url: "https://www.google.com", title: "Google" },
  discord: { url: "https://discord.com/app", title: "Discord" },
  twitter: { url: "https://x.com", title: "X" },
  x: { url: "https://x.com", title: "X" },
  github: { url: "https://github.com", title: "GitHub" },
  netflix: { url: "https://www.netflix.com", title: "Netflix" },
  whatsapp: { url: "https://web.whatsapp.com", title: "WhatsApp" },
  instagram: { url: "https://www.instagram.com", title: "Instagram" },
  wikipedia: { url: "https://www.wikipedia.org", title: "Wikipedia" },
  chatgpt: { url: "https://chatgpt.com", title: "ChatGPT" },
  maps: { url: "https://www.openstreetmap.org", title: "Harita" },
  harita: { url: "https://www.openstreetmap.org", title: "Harita" },
};

export function lookupSite(raw: string): Site | null {
  const n = fold(raw);
  for (const [key, site] of Object.entries(SITES)) {
    if (n.includes(key)) return site;
  }
  return null;
}

export function fold(s: string): string {
  return s
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/â/g, "a")
    .replace(/[^a-z0-9%.\s]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function ensureUrl(input: string): string {
  const t = input.trim();
  if (/^https?:\/\//i.test(t)) return t;
  if (/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(t)) return `https://${t}`;
  return `https://duckduckgo.com/?q=${encodeURIComponent(t)}`;
}
