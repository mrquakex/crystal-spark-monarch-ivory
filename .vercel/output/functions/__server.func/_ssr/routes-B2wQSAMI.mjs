import { i as __toESM } from "../_runtime.mjs";
import { R as require_react, v as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { C as Calculator, S as CloudSun, _ as MicOff, a as Trash2, b as Globe, c as Settings, d as Radio, f as Plus, g as Mic, h as Newspaper, l as Send, m as Pause, n as VolumeX, o as Timer, p as Play, r as Volume2, s as StickyNote, t as X, u as ScrollText, v as Map, x as ExternalLink, y as KeyRound } from "../_libs/lucide-react.mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { t as parseModelJson } from "./parse-D17yVsU9.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-B2wQSAMI.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var SYSTEM_PROMPT = `Sen JARVIS'sin — sakin, zeki, kısa konuşan bir asistan.
Kullanıcı Türkçe konuşuyorsa Türkçe yanıt ver; başka dildeyse o dilde yanıtla.
Asla uzun paragraf yazma. 1-2 cümle.

Bu bir tarayıcı asistanıdır. Masaüstü uygulamalarını (Discord uygulaması, Spotify uygulaması) açamazsın; web karşılıklarını açarsın.
Her yanıtını SADECE geçerli JSON olarak ver, markdown yok:

{
  "speak": "kullanıcıya söylenecek kısa cümle",
  "actions": [ /* 0 veya daha fazla aksiyon */ ]
}

Aksiyonlar:
- {"type":"play_music","query":"lofi"}
- {"type":"pause_music"}
- {"type":"resume_music"}
- {"type":"stop_music"}
- {"type":"set_volume","level":0-100}
- {"type":"open_app","app":"music|weather|notes|browser|timer|calc|maps|feed|settings|log"}
- {"type":"close_app","app":"..."}
- {"type":"close_top"}
- {"type":"open_url","url":"https://...","title":"YouTube"}
- {"type":"search_web","query":"..."}
- {"type":"set_timer","seconds":300,"label":"çay"}
- {"type":"add_note","text":"..."}
- {"type":"weather","city":"İstanbul"}
- {"type":"set_theme","mode":"night|dim|bright"}
- {"type":"calculate","expression":"24*7"}

Kurallar:
- Müzik / radyo / şarkı / lofi / jazz isteği → play_music. query'yi sade tut.
- "X'i aç" bir siteyse open_url (youtube, spotify, gmail, discord, google, x, github, netflix, whatsapp).
- Sohbet / bilgi soruları → actions boş, speak içinde yanıtla.
- Bilmediğin bir masaüstü programı için nazikçe web alternatifini öner.
- Saat sorusuna actions ekleme; speak içinde saati söyle (bağlamda verilir).`;
function contextBlock(input) {
	return `Bağlam: saat ${input.time}; tema ${input.theme}; çalan ${input.playing ?? "yok"}; açık paneller ${input.open.join(", ") || "yok"}; not sayısı ${input.notes}.`;
}
var MODELS = [
	"gemini-2.5-flash",
	"gemini-2.0-flash",
	"gemini-flash-latest"
];
function toContents(messages) {
	return messages.slice(-8).map((m) => ({
		role: m.role === "jarvis" ? "model" : "user",
		parts: [{ text: m.text }]
	}));
}
async function askGemini(key, messages, context) {
	let lastErr = "Gemini yanıt vermedi";
	for (const model of MODELS) try {
		const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
		const res = await fetch(url, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				system_instruction: { parts: [{ text: `${SYSTEM_PROMPT}\n${context}` }] },
				contents: toContents(messages),
				generationConfig: {
					temperature: .4,
					maxOutputTokens: 400,
					responseMimeType: "application/json"
				}
			})
		});
		if (!res.ok) {
			lastErr = `Gemini ${res.status}`;
			continue;
		}
		const text = (await res.json()).candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
		return parseModelJson(text);
	} catch (err) {
		lastErr = err instanceof Error ? err.message : "Gemini hatası";
	}
	throw new Error(lastErr);
}
async function probeGemini(key) {
	try {
		const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`;
		return (await fetch(url)).ok;
	} catch {
		return false;
	}
}
var SITES = {
	youtube: {
		url: "https://www.youtube.com",
		title: "YouTube"
	},
	spotify: {
		url: "https://open.spotify.com",
		title: "Spotify"
	},
	gmail: {
		url: "https://mail.google.com",
		title: "Gmail"
	},
	google: {
		url: "https://www.google.com",
		title: "Google"
	},
	discord: {
		url: "https://discord.com/app",
		title: "Discord"
	},
	twitter: {
		url: "https://x.com",
		title: "X"
	},
	x: {
		url: "https://x.com",
		title: "X"
	},
	github: {
		url: "https://github.com",
		title: "GitHub"
	},
	netflix: {
		url: "https://www.netflix.com",
		title: "Netflix"
	},
	whatsapp: {
		url: "https://web.whatsapp.com",
		title: "WhatsApp"
	},
	instagram: {
		url: "https://www.instagram.com",
		title: "Instagram"
	},
	wikipedia: {
		url: "https://www.wikipedia.org",
		title: "Wikipedia"
	},
	chatgpt: {
		url: "https://chatgpt.com",
		title: "ChatGPT"
	},
	maps: {
		url: "https://www.openstreetmap.org",
		title: "Harita"
	},
	harita: {
		url: "https://www.openstreetmap.org",
		title: "Harita"
	}
};
function lookupSite(raw) {
	const n = fold(raw);
	for (const [key, site] of Object.entries(SITES)) if (n.includes(key)) return site;
	return null;
}
function fold(s) {
	return s.toLowerCase().replace(/ı/g, "i").replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s").replace(/ö/g, "o").replace(/ç/g, "c").replace(/â/g, "a").replace(/[^a-z0-9%.\s]+/g, " ").replace(/\s+/g, " ").trim();
}
function ensureUrl(input) {
	const t = input.trim();
	if (/^https?:\/\//i.test(t)) return t;
	if (/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(t)) return `https://${t}`;
	return `https://duckduckgo.com/?q=${encodeURIComponent(t)}`;
}
var APP_ALIASES = {
	muzik: "music",
	music: "music",
	radyo: "music",
	hava: "weather",
	weather: "weather",
	not: "notes",
	notlar: "notes",
	notes: "notes",
	tarayici: "browser",
	browser: "browser",
	zamanlayici: "timer",
	timer: "timer",
	alarm: "timer",
	hesap: "calc",
	hesapmakinesi: "calc",
	calculator: "calc",
	harita: "maps",
	maps: "maps",
	haritalar: "maps",
	akis: "feed",
	haber: "feed",
	news: "feed",
	ayar: "settings",
	ayarlar: "settings",
	settings: "settings",
	gunluk: "log",
	log: "log"
};
function clock() {
	return new Intl.DateTimeFormat("tr-TR", {
		hour: "2-digit",
		minute: "2-digit"
	}).format(/* @__PURE__ */ new Date());
}
function parseDuration(n) {
	const m = n.match(/(\d+)\s*(saniye|sn|second|sec|dakika|dk|min|minute|saat|hour|hr)/);
	if (!m) return null;
	const v = Number(m[1]);
	const u = m[2];
	if (/saniye|sn|sec/.test(u)) return v;
	if (/saat|hour|hr/.test(u)) return v * 3600;
	return v * 60;
}
function reply(speak, ...actions) {
	return {
		speak,
		actions
	};
}
function parseIntent(raw) {
	const text = raw.trim();
	if (!text) return null;
	const n = fold(text);
	if (/(saat kac|saati soyle|what time|time is it)/.test(n)) return reply(`Saat ${clock()}.`);
	if (/(hangi gun|bugunun tarihi|what date|today)/.test(n) && /tarih|date|gun/.test(n)) return reply(`Bugün ${new Intl.DateTimeFormat("tr-TR", {
		weekday: "long",
		day: "numeric",
		month: "long"
	}).format(/* @__PURE__ */ new Date())}.`);
	if (/(sesi kapat|mute|sustur)/.test(n) && !/muzik/.test(n)) return reply("Sesi kestim.", {
		type: "set_volume",
		level: 0
	});
	if (/(sesi ac|unmute)/.test(n)) return reply("Ses açık.", {
		type: "set_volume",
		level: 72
	});
	const vol = n.match(/ses(?:i)?\s*(?:yuzde|%)?\s*(\d+)/) || n.match(/volume\s*(\d+)/);
	if (vol) {
		const level = Math.max(0, Math.min(100, Number(vol[1])));
		return reply(`Ses ${level}.`, {
			type: "set_volume",
			level
		});
	}
	if (/(sesi kis|kıs|volume down)/.test(n)) return reply("Kısıyorum.", {
		type: "set_volume",
		level: 35
	});
	if (/(sesi yukselt|sesi arttir|volume up)/.test(n)) return reply("Yükseltiyorum.", {
		type: "set_volume",
		level: 90
	});
	if (/(muzigi durdur|duraklat|pause|pause music)/.test(n)) return reply("Durdurdum.", { type: "pause_music" });
	if (/(muzigi kapat|stop music|radyoyu kapat)/.test(n)) return reply("Müziği kapattım.", { type: "stop_music" });
	if (/(devam et|resume|muzige devam|calmaya devam)/.test(n)) return reply("Devam.", { type: "resume_music" });
	const play = n.match(/^(?:bana |biraz )?(?:lofi|jazz|rock|pop|ambient|elektronik|chill|rap|metal|klasik|turkce).*(?:cal|play)/) || n.match(/(?:cal|play|radyo ac|muzik ac|muzik cal|play music|play some)\s+(.*)$/) || n.match(/^(?:cal|play)\s+(.+)/);
	if (/(muzik cal|muzik ac|radyo ac|play music|biraz muzik|sarki cal)/.test(n) && !play) return reply("Açıyorum.", {
		type: "play_music",
		query: "chill"
	}, {
		type: "open_app",
		app: "music"
	});
	if (play) return reply("Çalıyorum.", {
		type: "play_music",
		query: (play[1] ?? n).replace(/^(bana|biraz|lutfen)\s+/, "").replace(/\s+(cal|play|ac)$/g, "").replace(/^(cal|play|ac)\s+/, "").trim() || "chill"
	}, {
		type: "open_app",
		app: "music"
	});
	if (/^(lofi|jazz|chill|ambient|elektronik)\s*(cal|ac)?$/.test(n)) return reply("Çalıyorum.", {
		type: "play_music",
		query: n
	}, {
		type: "open_app",
		app: "music"
	});
	if (/(hava durumu|havasi nasil|weather)/.test(n)) return reply("Bakıyorum.", {
		type: "weather",
		city: text.replace(/hava durumu/i, "").replace(/havası nasıl/i, "").replace(/weather( in)?/i, "").replace(/\b(icin|için|ne|nasil|nasıl)\b/gi, "").trim() || void 0
	}, {
		type: "open_app",
		app: "weather"
	});
	const dur = parseDuration(n);
	if (dur && /(timer|zamanlayici|alarm|hatirlat|geri say)/.test(n)) return reply(`${Math.round(dur / 60) || dur} birimlik sayacı kurdum.`, {
		type: "set_timer",
		seconds: dur,
		label: text
	}, {
		type: "open_app",
		app: "timer"
	});
	if (dur && /(dakika|saat).*(sonra|hatirlat)/.test(n)) return reply("Kuruldu.", {
		type: "set_timer",
		seconds: dur,
		label: "hatırlatma"
	}, {
		type: "open_app",
		app: "timer"
	});
	const note = text.match(/^(?:not al|not et|kaydet|hatırla|hatirla)\s*[:\-]?\s*(.+)/i);
	if (note?.[1]) return reply("Not aldım.", {
		type: "add_note",
		text: note[1]
	}, {
		type: "open_app",
		app: "notes"
	});
	const calc = text.match(/^(?:hesapla|calculate)\s+(.+)/i);
	if (calc?.[1]) return reply("Hesaplıyorum.", {
		type: "calculate",
		expression: calc[1]
	}, {
		type: "open_app",
		app: "calc"
	});
	if (/^[\d\s+\-*/().x×÷,]+$/.test(text) && /[+\-*/x×÷]/.test(text)) return reply("Hesaplıyorum.", {
		type: "calculate",
		expression: text
	}, {
		type: "open_app",
		app: "calc"
	});
	const search = text.match(/^(?:google(?:'?da| da)?|web(?:'?de| de)?|internette)\s*(?:ara|:)\s*(.+)/i);
	if (search?.[1]) return reply("Arıyorum.", {
		type: "search_web",
		query: search[1]
	});
	const yt = text.match(/youtube(?:'?da| da)?\s*(?:ara|:)\s*(.+)/i);
	if (yt?.[1]) return reply("YouTube'da bakıyorum.", {
		type: "open_url",
		url: `https://www.youtube.com/results?search_query=${encodeURIComponent(yt[1])}`,
		title: "YouTube"
	});
	if (/(isiklari kapat|karanlik|dim|gece modu|night mode)/.test(n)) return reply("Ayarladım.", {
		type: "set_theme",
		mode: /bright|aydinlik|isiklari ac/.test(n) ? "bright" : /dim/.test(n) ? "dim" : "night"
	});
	if (/(isiklari ac|aydinlik|gunduz|bright)/.test(n)) return reply("Aydınlatıyorum.", {
		type: "set_theme",
		mode: "bright"
	});
	if (/^(kapat|close|pencereyi kapat)$/.test(n)) return reply("Kapattım.", { type: "close_top" });
	for (const [alias, app] of Object.entries(APP_ALIASES)) if (new RegExp(`(^|\\s)${alias}(i|u|yi|yu)?\\s*(ac|open)|\\bopen ${alias}\\b`).test(n) || n === `${alias} ac`) {
		if (app === "music" && /(cal|play)/.test(n)) continue;
		return reply("Açıyorum.", {
			type: "open_app",
			app
		});
	}
	if (/(ac|open)/.test(n)) {
		const site = lookupSite(n);
		if (site) return reply(`${site.title} açılıyor.`, {
			type: "open_url",
			url: site.url,
			title: site.title
		});
	}
	if (/^(merhaba|selam|hey jarvis|hi jarvis|hello|gunaydin|iyi aksamlar)/.test(n)) return reply("Buradayım.");
	if (/^(tesekkur|tesekkurler|sag ol|thanks)/.test(n)) return reply("Ne demek.");
	return null;
}
var zCounter = 10;
var useJarvis = create()(persist((set, get) => ({
	hydrated: false,
	phase: "boot",
	booted: false,
	geminiKey: "",
	voiceEnabled: true,
	volume: 72,
	muted: false,
	theme: "night",
	nowPlaying: null,
	playing: false,
	playBlocked: false,
	browserUrl: "https://www.wikipedia.org",
	browserTitle: "Wikipedia",
	mapQuery: "İstanbul",
	lastHeard: "",
	lastSpoke: "",
	error: null,
	messages: [],
	notes: [],
	timers: [],
	windows: [],
	weather: null,
	calcValue: "0",
	startedAt: Date.now(),
	setHydrated: () => set({ hydrated: true }),
	setPhase: (phase) => set({ phase }),
	finishBoot: () => set({
		booted: true,
		phase: "idle"
	}),
	setGeminiKey: (key) => set({ geminiKey: key.trim() }),
	setVoiceEnabled: (on) => set({ voiceEnabled: on }),
	setVolume: (n) => set({
		volume: Math.max(0, Math.min(100, n)),
		muted: n === 0
	}),
	setMuted: (on) => set({ muted: on }),
	setTheme: (theme) => set({ theme }),
	setNowPlaying: (station) => set({ nowPlaying: station }),
	setPlaying: (on) => set({ playing: on }),
	setPlayBlocked: (on) => set({ playBlocked: on }),
	setBrowser: (url, title) => set({
		browserUrl: url,
		browserTitle: title
	}),
	setMapQuery: (q) => set({ mapQuery: q }),
	setLastHeard: (text) => set({ lastHeard: text }),
	setLastSpoke: (text) => set({ lastSpoke: text }),
	setError: (error) => set({ error }),
	pushMessage: (msg) => set({ messages: [...get().messages, msg].slice(-40) }),
	addNote: (note) => set({ notes: [note, ...get().notes].slice(0, 80) }),
	removeNote: (id) => set({ notes: get().notes.filter((n) => n.id !== id) }),
	addTimer: (timer) => set({ timers: [...get().timers, timer] }),
	removeTimer: (id) => set({ timers: get().timers.filter((t) => t.id !== id) }),
	openWindow: (id) => {
		const existing = get().windows.find((w) => w.id === id);
		zCounter += 1;
		if (existing) {
			set({ windows: get().windows.map((w) => w.id === id ? {
				...w,
				z: zCounter
			} : w) });
			return;
		}
		const offset = get().windows.length % 5 * 22;
		set({ windows: [...get().windows, {
			id,
			x: 48 + offset,
			y: 72 + offset,
			z: zCounter
		}] });
	},
	closeWindow: (id) => set({ windows: get().windows.filter((w) => w.id !== id) }),
	closeTopWindow: () => {
		const wins = get().windows;
		if (!wins.length) return null;
		const top = [...wins].sort((a, b) => b.z - a.z)[0];
		if (!top) return null;
		set({ windows: wins.filter((w) => w.id !== top.id) });
		return top.id;
	},
	focusWindow: (id) => {
		zCounter += 1;
		set({ windows: get().windows.map((w) => w.id === id ? {
			...w,
			z: zCounter
		} : w) });
	},
	setWeather: (w) => set({ weather: w }),
	setCalcValue: (v) => set({ calcValue: v })
}), {
	name: "jarvis-os-v1",
	partialize: (s) => ({
		geminiKey: s.geminiKey,
		voiceEnabled: s.voiceEnabled,
		volume: s.volume,
		theme: s.theme,
		notes: s.notes,
		browserUrl: s.browserUrl,
		browserTitle: s.browserTitle
	}),
	onRehydrateStorage: () => () => {
		useJarvis.getState().setHydrated();
	}
}));
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var askGrok = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("818723433dd5250f83fe230bd82594e511b8ba46423de9109b2e3faebc57c290"));
async function askGrokClient(messages, system) {
	const result = await askGrok({ data: {
		system,
		messages: messages.map((m) => ({
			role: m.role,
			text: m.text
		}))
	} });
	if (!result.ok) throw new Error(result.error);
	return result.reply;
}
async function interpret(text) {
	const local = parseIntent(text);
	if (local) return local;
	const s = useJarvis.getState();
	const ctx = contextBlock({
		time: new Intl.DateTimeFormat("tr-TR", {
			weekday: "short",
			hour: "2-digit",
			minute: "2-digit"
		}).format(/* @__PURE__ */ new Date()),
		theme: s.theme,
		playing: s.playing && s.nowPlaying ? s.nowPlaying.name : null,
		open: s.windows.map((w) => w.id),
		notes: s.notes.length
	});
	const history = [...s.messages, {
		id: "tmp",
		role: "user",
		text,
		at: Date.now()
	}];
	if (s.geminiKey) try {
		return await askGemini(s.geminiKey, history, ctx);
	} catch {}
	try {
		return await askGrokClient(history, `${SYSTEM_PROMPT}\n${ctx}`);
	} catch {
		return {
			speak: "Çevrimdışı moddayım. Müzik, saat, hava, not, zamanlayıcı ve site açmayı deneyin. Gemini anahtarı Ayarlar'da.",
			actions: []
		};
	}
}
function evalMath(expr) {
	const cleaned = expr.replace(/,/g, ".").replace(/×/g, "*").replace(/x/gi, "*").replace(/÷/g, "/").replace(/çarpı/gi, "*").replace(/artı/gi, "+").replace(/eksi/gi, "-").replace(/bölü/gi, "/").replace(/[^0-9+\-*/().\s]/g, "");
	if (!cleaned.trim()) throw new Error("ifade yok");
	if (!/^[\d+\-*/().\s]+$/.test(cleaned)) throw new Error("geçersiz");
	const result = new Function(`"use strict"; return (${cleaned})`)();
	if (typeof result !== "number" || !Number.isFinite(result)) throw new Error("tanımsız");
	return Number.isInteger(result) ? String(result) : String(Math.round(result * 1e4) / 1e4);
}
function uid(prefix = "id") {
	return `${prefix}-${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`;
}
var CATALOG = [
	{
		name: "Groove Salad",
		url: "https://ice4.somafm.com/groovesalad-128-mp3",
		tags: "ambient lounge chill lofi sakin"
	},
	{
		name: "Drone Zone",
		url: "https://ice4.somafm.com/dronezone-128-mp3",
		tags: "ambient drone atmospheric"
	},
	{
		name: "Lush",
		url: "https://ice4.somafm.com/lush-128-mp3",
		tags: "mellow female vocal"
	},
	{
		name: "Beat Blender",
		url: "https://ice4.somafm.com/beatblender-128-mp3",
		tags: "downtempo electronic lofi chill"
	},
	{
		name: "Space Station",
		url: "https://ice4.somafm.com/spacestation-128-mp3",
		tags: "electronic space ambient"
	},
	{
		name: "Secret Agent",
		url: "https://ice4.somafm.com/secretagent-128-mp3",
		tags: "lounge spy jazz"
	},
	{
		name: "Sonic Universe",
		url: "https://ice4.somafm.com/sonicuniverse-128-mp3",
		tags: "jazz avant"
	},
	{
		name: "Indie Pop Rocks",
		url: "https://ice4.somafm.com/indiepop-128-mp3",
		tags: "indie pop rock"
	},
	{
		name: "The Trip",
		url: "https://ice4.somafm.com/thetrip-128-mp3",
		tags: "house trance dance elektronik"
	},
	{
		name: "Digitalis",
		url: "https://ice4.somafm.com/digitalis-128-mp3",
		tags: "shoegaze indie electronic"
	},
	{
		name: "DEF CON Radio",
		url: "https://ice4.somafm.com/defcon-128-mp3",
		tags: "electronic hype"
	},
	{
		name: "Boot Liquor",
		url: "https://ice4.somafm.com/bootliquor-128-mp3",
		tags: "americana country folk"
	}
];
var GENRE_HINT = {
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
	uzay: "Space Station"
};
function score(station, q) {
	const hay = `${station.name} ${station.tags}`.toLowerCase();
	if (hay.includes(q)) return q.length + (station.name.toLowerCase().includes(q) ? 8 : 0);
	return q.split(/\s+/).reduce((n, w) => n + (w.length > 2 && hay.includes(w) ? w.length : 0), 0);
}
async function findStation(query) {
	const q = query.trim().toLowerCase();
	if (!q || q === "muzik" || q === "müzik" || q === "music" || q === "radyo") return CATALOG[0];
	const hint = Object.entries(GENRE_HINT).find(([k]) => q.includes(k));
	if (hint) {
		const named = CATALOG.find((s) => s.name === hint[1]);
		if (named) return named;
	}
	const local = [...CATALOG].sort((a, b) => score(b, q) - score(a, q))[0];
	if (local && score(local, q) >= 3) return local;
	try {
		const url = "https://de1.api.radio-browser.info/json/stations/search?" + new URLSearchParams({
			name: query,
			hidebroken: "true",
			limit: "8",
			order: "clickcount",
			reverse: "true"
		}).toString();
		const res = await fetch(url, { headers: { "User-Agent": "JARVIS/1.0" } });
		if (res.ok) {
			const hit = (await res.json()).find((r) => r.url_resolved || r.url);
			if (hit) return {
				name: hit.name,
				url: hit.url_resolved || hit.url || "",
				tags: hit.tags ?? "",
				bitrate: hit.bitrate
			};
		}
	} catch {}
	return local ?? CATALOG[0];
}
var APP_META = {
	music: {
		title: "Müzik",
		hint: "Radyo ve çalar"
	},
	weather: {
		title: "Hava",
		hint: "Anlık durum"
	},
	notes: {
		title: "Notlar",
		hint: "Hızlı kayıt"
	},
	browser: {
		title: "Tarayıcı",
		hint: "Siteler"
	},
	timer: {
		title: "Zamanlayıcı",
		hint: "Geri sayım"
	},
	calc: {
		title: "Hesap",
		hint: "Hesap makinesi"
	},
	maps: {
		title: "Harita",
		hint: "Konum"
	},
	feed: {
		title: "Akış",
		hint: "Başlıklar"
	},
	settings: {
		title: "Ayarlar",
		hint: "Gemini anahtarı"
	},
	log: {
		title: "Günlük",
		hint: "Konuşma kaydı"
	}
};
var WMO = {
	0: "açık",
	1: "çoğunlukla açık",
	2: "parçalı bulutlu",
	3: "kapalı",
	45: "sisli",
	48: "kırağılı sis",
	51: "hafif çisenti",
	61: "hafif yağmur",
	63: "yağmur",
	65: "şiddetli yağmur",
	71: "hafif kar",
	73: "kar",
	75: "yoğun kar",
	80: "sağanak",
	95: "gök gürültülü"
};
function weatherLabel(code) {
	return WMO[code] ?? "değişken";
}
async function fetchWeather(city) {
	let lat = 41.0082;
	let lon = 28.9784;
	let name = "İstanbul";
	const q = city?.trim();
	if (q) {
		const geo = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=1&language=tr`);
		if (geo.ok) {
			const hit = (await geo.json()).results?.[0];
			if (hit) {
				lat = hit.latitude;
				lon = hit.longitude;
				name = hit.name;
			}
		}
	}
	const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`);
	if (!res.ok) throw new Error("Hava alınamadı");
	const data = await res.json();
	return {
		city: name,
		temp: Math.round(data.current.temperature_2m),
		code: data.current.weather_code,
		wind: Math.round(data.current.wind_speed_10m),
		humidity: Math.round(data.current.relative_humidity_2m),
		daily: data.daily.time.map((date, i) => ({
			date,
			min: Math.round(data.daily.temperature_2m_min[i] ?? 0),
			max: Math.round(data.daily.temperature_2m_max[i] ?? 0),
			code: data.daily.weather_code[i] ?? 0
		})),
		fetchedAt: Date.now()
	};
}
async function runReply(reply) {
	let speak = reply.speak;
	for (const action of reply.actions) {
		const extra = await runAction(action);
		if (extra) speak = extra;
	}
	return speak;
}
async function runAction(action) {
	const s = useJarvis.getState();
	switch (action.type) {
		case "play_music": {
			const station = await findStation(action.query);
			s.setNowPlaying(station);
			s.setPlaying(true);
			s.setMuted(false);
			s.openWindow("music");
			return `${station.name} çalıyor.`;
		}
		case "pause_music":
			s.setPlaying(false);
			return "Durdurdum.";
		case "resume_music":
			if (!s.nowPlaying) {
				const station = await findStation("chill");
				s.setNowPlaying(station);
			}
			s.setPlaying(true);
			return "Devam.";
		case "stop_music":
			s.setPlaying(false);
			s.setNowPlaying(null);
			return "Müziği kapattım.";
		case "set_volume":
			s.setVolume(action.level);
			if (action.level === 0) s.setMuted(true);
			else s.setMuted(false);
			return `Ses ${action.level}.`;
		case "open_app":
			s.openWindow(action.app);
			return `${APP_META[action.app].title} açık.`;
		case "close_app":
			s.closeWindow(action.app);
			return "Kapattım.";
		case "close_top": return s.closeTopWindow() ? "Kapattım." : "Açık panel yok.";
		case "open_url": {
			const url = ensureUrl(action.url);
			s.setBrowser(url, action.title ?? "Tarayıcı");
			s.openWindow("browser");
			return `${action.title ?? "Sayfa"} açılıyor.`;
		}
		case "search_web": {
			const url = `https://duckduckgo.com/?q=${encodeURIComponent(action.query)}`;
			s.setBrowser(url, action.query);
			s.openWindow("browser");
			return "Arama açık.";
		}
		case "set_timer": {
			const seconds = Math.max(5, Math.min(86400, Math.round(action.seconds)));
			s.addTimer({
				id: uid("t"),
				label: action.label?.slice(0, 48) || "zamanlayıcı",
				seconds,
				endsAt: Date.now() + seconds * 1e3
			});
			s.openWindow("timer");
			const mins = Math.round(seconds / 60);
			return mins >= 1 ? `${mins} dakikalık sayaç kuruldu.` : `${seconds} saniyelik sayaç kuruldu.`;
		}
		case "add_note":
			if (action.text.trim()) {
				s.addNote({
					id: uid("n"),
					text: action.text.trim(),
					at: Date.now()
				});
				s.openWindow("notes");
			}
			return "Not aldım.";
		case "weather": try {
			const w = await fetchWeather(action.city);
			s.setWeather(w);
			s.openWindow("weather");
			return `${w.city}: ${w.temp}°, ${weatherLabel(w.code)}.`;
		} catch {
			return "Havayı alamadım.";
		}
		case "set_theme":
			s.setTheme(action.mode);
			return "Tema güncellendi.";
		case "calculate": try {
			const result = evalMath(action.expression);
			s.setCalcValue(result);
			s.openWindow("calc");
			return `Sonuç ${result}.`;
		} catch {
			return "Bunu hesaplayamadım.";
		}
		default: return null;
	}
}
function getRecogCtor() {
	if (typeof window === "undefined") return null;
	const w = window;
	return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}
function canListen() {
	return getRecogCtor() !== null;
}
function pickVoice() {
	if (typeof window === "undefined" || !window.speechSynthesis) return null;
	const voices = window.speechSynthesis.getVoices();
	const tr = voices.find((v) => v.lang.toLowerCase().startsWith("tr"));
	if (tr) return tr;
	return voices.find((v) => /en[-_]/i.test(v.lang) && /google|premium|natural/i.test(v.name)) ?? voices[0] ?? null;
}
function speakText(text, onEnd) {
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
	u.pitch = .88;
	u.volume = 1;
	u.onend = () => onEnd?.();
	u.onerror = () => onEnd?.();
	window.speechSynthesis.speak(u);
}
function silence() {
	if (typeof window === "undefined") return;
	window.speechSynthesis?.cancel();
}
function warmVoices() {
	if (typeof window === "undefined") return;
	window.speechSynthesis?.getVoices();
	window.speechSynthesis?.addEventListener("voiceschanged", () => {
		window.speechSynthesis.getVoices();
	});
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function useNow(ms = 1e3) {
	const [now, setNow] = (0, import_react.useState)(() => /* @__PURE__ */ new Date());
	(0, import_react.useEffect)(() => {
		const id = setInterval(() => setNow(/* @__PURE__ */ new Date()), ms);
		return () => clearInterval(id);
	}, [ms]);
	return now;
}
function ClockLine() {
	const now = useNow();
	const time = new Intl.DateTimeFormat("tr-TR", {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit"
	}).format(now);
	const date = new Intl.DateTimeFormat("tr-TR", {
		weekday: "short",
		day: "numeric",
		month: "short"
	}).format(now);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-mono text-2xl tracking-tight tabular-nums text-fg",
			children: time
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-mono text-[11px] tracking-[0.18em] text-muted uppercase",
			children: date
		})]
	});
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 font-medium transition-transform duration-150 ease-out active:not-disabled:scale-[0.96] disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50", {
	variants: {
		variant: {
			primary: "bg-fg text-bg hover:opacity-90",
			ghost: "bg-transparent text-fg border border-line hover:bg-elevated",
			accent: "bg-accent text-accent-fg hover:opacity-90",
			quiet: "bg-transparent text-muted hover:text-fg hover:bg-elevated"
		},
		size: {
			sm: "h-9 px-3 text-sm rounded-sm",
			md: "h-11 px-4 text-sm rounded-md",
			icon: "size-11 rounded-md"
		}
	},
	defaultVariants: {
		variant: "primary",
		size: "md"
	}
});
function Button({ className, variant, size, type = "button", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type,
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
}
function CommandBar({ value, onChange, onSubmit, listening, busy, onMic }) {
	const ref = (0, import_react.useRef)(null);
	const listenOk = canListen();
	(0, import_react.useEffect)(() => {
		const onKey = (e) => {
			if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
				e.preventDefault();
				ref.current?.focus();
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);
	const handle = (e) => {
		e.preventDefault();
		const t = value.trim();
		if (!t || busy) return;
		onSubmit(t);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit: handle,
		className: "flex items-center gap-2 rounded-xl border border-line bg-surface p-1.5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "quiet",
				size: "icon",
				onClick: onMic,
				disabled: !listenOk,
				"aria-pressed": listening,
				"aria-label": listening ? "Mikrofonu kapat" : "Mikrofon",
				className: cn(listening && "text-accent"),
				children: listenOk ? listening ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, { className: "size-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, { className: "size-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MicOff, { className: "size-5" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				ref,
				value,
				onChange: (e) => onChange(e.target.value),
				placeholder: "Komut yaz veya konuş — müzik çal, youtube aç",
				disabled: busy,
				className: "h-11 min-w-0 flex-1 bg-transparent px-1 text-sm text-fg placeholder:text-subtle focus:outline-none"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "submit",
				variant: "accent",
				size: "icon",
				disabled: busy || !value.trim(),
				"aria-label": "Gönder",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-4" })
			})
		]
	});
}
function Corners() {
	const arm = "pointer-events-none absolute size-9 border-fg/25";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `${arm} top-3 left-3 border-t border-l` }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `${arm} top-3 right-3 border-t border-r` }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `${arm} bottom-3 left-3 border-b border-l` }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `${arm} bottom-3 right-3 border-b border-r` })
	] });
}
var ICONS = [
	{
		id: "music",
		icon: Radio
	},
	{
		id: "weather",
		icon: CloudSun
	},
	{
		id: "notes",
		icon: StickyNote
	},
	{
		id: "browser",
		icon: Globe
	},
	{
		id: "timer",
		icon: Timer
	},
	{
		id: "calc",
		icon: Calculator
	},
	{
		id: "maps",
		icon: Map
	},
	{
		id: "feed",
		icon: Newspaper
	}
];
function Dock() {
	const openWindow = useJarvis((s) => s.openWindow);
	const windows = useJarvis((s) => s.windows);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		"aria-label": "Uygulamalar",
		className: "flex flex-wrap items-center justify-center gap-1 rounded-xl border border-line bg-surface/90 p-1.5",
		children: ICONS.map(({ id, icon: Icon }) => {
			const active = windows.some((w) => w.id === id);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				title: APP_META[id].title,
				onClick: () => openWindow(id),
				className: cn("flex size-11 items-center justify-center rounded-md text-muted transition-colors duration-150 hover:bg-elevated hover:text-fg", active && "bg-elevated text-fg"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
					className: "size-5",
					strokeWidth: 1.6
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "sr-only",
					children: APP_META[id].title
				})]
			}, id);
		})
	});
}
function MusicEngine() {
	const ref = (0, import_react.useRef)(null);
	const nowPlaying = useJarvis((s) => s.nowPlaying);
	const playing = useJarvis((s) => s.playing);
	const volume = useJarvis((s) => s.volume);
	const muted = useJarvis((s) => s.muted);
	const setPlayBlocked = useJarvis((s) => s.setPlayBlocked);
	const setPlaying = useJarvis((s) => s.setPlaying);
	(0, import_react.useEffect)(() => {
		const el = ref.current;
		if (!el) return;
		if (!nowPlaying) {
			el.pause();
			el.removeAttribute("src");
			return;
		}
		if (el.getAttribute("src") !== nowPlaying.url) el.src = nowPlaying.url;
		if (playing) el.play().then(() => setPlayBlocked(false)).catch(() => setPlayBlocked(true));
		else el.pause();
	}, [
		nowPlaying,
		playing,
		setPlayBlocked
	]);
	(0, import_react.useEffect)(() => {
		const el = ref.current;
		if (!el) return;
		el.volume = muted ? 0 : volume / 100;
	}, [muted, volume]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("audio", {
		ref,
		className: "hidden",
		preload: "none",
		onEnded: () => setPlaying(false)
	});
}
function Orb({ phase, level = 0, onToggle }) {
	const listening = phase === "listening";
	const thinking = phase === "thinking";
	const speaking = phase === "speaking";
	const ringScale = 1 + (listening ? level * .12 : 0);
	const status = phase === "listening" ? "Dinliyor" : phase === "thinking" ? "Düşünüyor" : phase === "speaking" ? "Konuşuyor" : "Hazır";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: onToggle,
		"aria-label": listening ? "Dinlemeyi durdur" : "Konuşmaya başla",
		className: "group relative mx-auto flex size-[min(52vw,280px)] items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "absolute inset-[8%] rounded-full border border-line",
				style: { transform: `scale(${ringScale})` }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute inset-[16%] rounded-full border border-line/80" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("absolute inset-[24%] rounded-full border border-accent/35", speaking && "orb-speak", !listening && !thinking && !speaking && "orb-breathe") }),
			thinking ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
				className: "orb-spin absolute inset-[12%] text-accent",
				viewBox: "0 0 100 100",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "50",
					cy: "50",
					r: "46",
					fill: "none",
					stroke: "currentColor",
					strokeWidth: "1.2",
					strokeDasharray: "40 220",
					strokeLinecap: "round",
					opacity: "0.9"
				})
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "relative flex flex-col items-center gap-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-mono text-xs tracking-[0.28em] text-subtle uppercase",
					children: "J.A.R.V.I.S."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("font-mono text-[11px] tracking-[0.22em] uppercase", listening || speaking ? "text-accent" : "text-muted"),
					children: status
				})]
			})
		]
	});
}
var CHIPS = [
	"Müzik çal",
	"Saat kaç",
	"Hava durumu",
	"YouTube aç",
	"5 dakika timer"
];
function SuggestionChips({ onPick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-wrap justify-center gap-1.5",
		children: CHIPS.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: () => onPick(c),
			className: "h-9 rounded-full border border-line px-3 text-xs text-muted hover:bg-elevated hover:text-fg",
			children: c
		}, c))
	});
}
function StatusRail() {
	const weather = useJarvis((s) => s.weather);
	const geminiKey = useJarvis((s) => s.geminiKey);
	const nowPlaying = useJarvis((s) => s.nowPlaying);
	const playing = useJarvis((s) => s.playing);
	const startedAt = useJarvis((s) => s.startedAt);
	const minutes = Math.max(0, Math.floor((Date.now() - startedAt) / 6e4));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: "hidden w-52 shrink-0 flex-col gap-6 md:flex",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClockLine, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "flex flex-col gap-3 font-mono text-[11px] tracking-[0.12em] text-muted uppercase",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 rounded-full bg-ok" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Çevrimiçi" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { className: "size-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: geminiKey ? "Gemini" : "Grok" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						"Uptime ",
						minutes,
						" dk"
					] })
				]
			}),
			weather ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => useJarvis.getState().openWindow("weather"),
				className: "flex items-start gap-2 text-left",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudSun, { className: "mt-0.5 size-4 text-muted" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "block text-sm text-fg",
					children: [
						weather.city,
						" ",
						weather.temp,
						"°"
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs text-muted",
					children: weatherLabel(weather.code)
				})] })]
			}) : null,
			nowPlaying && playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => useJarvis.getState().openWindow("music"),
				className: "flex items-start gap-2 text-left",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { className: "mt-0.5 size-4 text-accent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block text-xs text-subtle uppercase tracking-[0.14em]",
					children: "Çalıyor"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm text-fg",
					children: nowPlaying.name
				})] })]
			}) : null
		]
	});
}
function TopBar() {
	const geminiKey = useJarvis((s) => s.geminiKey);
	const openWindow = useJarvis((s) => s.openWindow);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between gap-3 md:hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-mono text-[11px] tracking-[0.28em] text-subtle uppercase",
			children: "J.A.R.V.I.S."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "flex items-center gap-2 font-mono text-[11px] tracking-[0.16em] text-muted uppercase",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 rounded-full bg-ok" }), geminiKey ? "Gemini" : "Grok"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "flex size-11 items-center justify-center rounded-md text-muted hover:text-fg",
				onClick: () => openWindow("settings"),
				"aria-label": "Ayarlar",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "size-4" })
			})]
		})]
	});
}
function AppPanel({ id }) {
	switch (id) {
		case "music": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MusicPanel, {});
		case "weather": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WeatherPanel, {});
		case "notes": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotesPanel, {});
		case "browser": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrowserPanel, {});
		case "timer": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TimerPanel, {});
		case "calc": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalcPanel, {});
		case "maps": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapsPanel, {});
		case "feed": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeedPanel, {});
		case "settings": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsPanel, {});
		case "log": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogPanel, {});
		default: return null;
	}
}
function MusicPanel() {
	const nowPlaying = useJarvis((s) => s.nowPlaying);
	const playing = useJarvis((s) => s.playing);
	const volume = useJarvis((s) => s.volume);
	const muted = useJarvis((s) => s.muted);
	const playBlocked = useJarvis((s) => s.playBlocked);
	const setNowPlaying = useJarvis((s) => s.setNowPlaying);
	const setPlaying = useJarvis((s) => s.setPlaying);
	const setVolume = useJarvis((s) => s.setVolume);
	const setMuted = useJarvis((s) => s.setMuted);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-[11px] tracking-[0.18em] text-subtle uppercase",
					children: "Şimdi"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-lg font-medium",
					children: nowPlaying?.name ?? "Sessiz"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: nowPlaying?.tags || "Bir istasyon seç"
				})
			] }),
			playBlocked && playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "accent",
				onClick: () => {
					setPlaying(true);
				},
				children: "Çalmak için dokun"
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						onClick: () => {
							if (!nowPlaying) setNowPlaying(CATALOG[0]);
							setPlaying(!playing);
						},
						"aria-label": playing ? "Duraklat" : "Çal",
						children: playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "text-muted",
						onClick: () => setMuted(!muted),
						"aria-label": "Ses",
						children: muted || volume === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "range",
						min: 0,
						max: 100,
						value: muted ? 0 : volume,
						onChange: (e) => setVolume(Number(e.target.value)),
						className: "h-11 flex-1 accent-accent"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "grid grid-cols-1 gap-1 sm:grid-cols-2",
				children: CATALOG.map((st) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => {
						setNowPlaying(st);
						setPlaying(true);
					},
					className: cn("w-full rounded-md border border-line px-3 py-2.5 text-left text-sm hover:bg-elevated", nowPlaying?.name === st.name && "border-accent/40 bg-elevated"),
					children: st.name
				}) }, st.name))
			})
		]
	});
}
function WeatherPanel() {
	const weather = useJarvis((s) => s.weather);
	if (!weather) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: "“Hava durumu” de, bakayım."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-[11px] tracking-[0.18em] text-subtle uppercase",
					children: weather.city
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-4xl font-medium tracking-tight tabular-nums",
					children: [weather.temp, "°"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: weatherLabel(weather.code)
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: [
					"Rüzgar ",
					weather.wind,
					" km/s · nem %",
					weather.humidity
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "grid grid-cols-5 gap-2",
				children: weather.daily.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-md border border-line bg-elevated px-1 py-2 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-[10px] text-subtle uppercase",
							children: new Intl.DateTimeFormat("tr-TR", { weekday: "short" }).format(new Date(d.date))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-sm tabular-nums",
							children: [d.max, "°"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted tabular-nums",
							children: [d.min, "°"]
						})
					]
				}, d.date))
			})
		]
	});
}
function NotesPanel() {
	const notes = useJarvis((s) => s.notes);
	const addNote = useJarvis((s) => s.addNote);
	const removeNote = useJarvis((s) => s.removeNote);
	const [draft, setDraft] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "flex gap-2",
			onSubmit: (e) => {
				e.preventDefault();
				if (!draft.trim()) return;
				addNote({
					id: uid("n"),
					text: draft.trim(),
					at: Date.now()
				});
				setDraft("");
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				value: draft,
				onChange: (e) => setDraft(e.target.value),
				placeholder: "Not yaz",
				className: "h-11 flex-1 rounded-md border border-line bg-elevated px-3 text-sm text-fg placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-accent/40"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "submit",
				variant: "ghost",
				size: "icon",
				"aria-label": "Ekle",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" })
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "flex max-h-64 flex-col gap-2 overflow-auto",
			children: notes.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
				className: "text-sm text-muted",
				children: "Henüz not yok."
			}) : notes.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex items-start justify-between gap-2 rounded-md border border-line bg-elevated px-3 py-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm leading-snug",
					children: n.text
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "text-subtle hover:text-fg",
					onClick: () => removeNote(n.id),
					"aria-label": "Sil",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
				})]
			}, n.id))
		})]
	});
}
function BrowserPanel() {
	const url = useJarvis((s) => s.browserUrl);
	const title = useJarvis((s) => s.browserTitle);
	const setBrowser = useJarvis((s) => s.setBrowser);
	const [draft, setDraft] = (0, import_react.useState)(url);
	const [blocked, setBlocked] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setDraft(url);
		setBlocked(false);
	}, [url]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full min-h-64 flex-col gap-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "flex gap-2",
				onSubmit: (e) => {
					e.preventDefault();
					const next = ensureUrl(draft);
					setBrowser(next, title);
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: draft,
					onChange: (e) => setDraft(e.target.value),
					className: "h-11 flex-1 rounded-md border border-line bg-elevated px-3 font-mono text-xs text-fg focus:outline-none focus:ring-2 focus:ring-accent/40"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: url,
					target: "_blank",
					rel: "noreferrer",
					className: "inline-flex size-11 items-center justify-center rounded-md border border-line text-muted hover:text-fg",
					"aria-label": "Yeni sekmede aç",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-4" })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative min-h-52 flex-1 overflow-hidden rounded-md border border-line bg-elevated",
				children: blocked ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex h-full flex-col items-start justify-center gap-3 p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "Bu site çerçeve içinde açılmıyor. Yeni sekmede aç."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: url,
						target: "_blank",
						rel: "noreferrer",
						className: "inline-flex h-11 items-center rounded-md bg-fg px-4 text-sm font-medium text-bg",
						children: [title, " — aç"]
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
					title,
					src: url,
					className: "h-full min-h-52 w-full bg-elevated",
					onLoad: () => {},
					onError: () => setBlocked(true)
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "self-start text-xs text-muted underline-offset-2 hover:text-fg hover:underline",
				onClick: () => setBlocked(true),
				children: "Çerçeve boşsa buraya dokun"
			})
		]
	});
}
function TimerPanel() {
	const timers = useJarvis((s) => s.timers);
	const addTimer = useJarvis((s) => s.addTimer);
	const removeTimer = useJarvis((s) => s.removeTimer);
	const now = useNow(250);
	const [mins, setMins] = (0, import_react.useState)("5");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "flex gap-2",
			onSubmit: (e) => {
				e.preventDefault();
				const seconds = Math.max(5, Number(mins) * 60);
				addTimer({
					id: uid("t"),
					label: `${mins} dk`,
					seconds,
					endsAt: Date.now() + seconds * 1e3
				});
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				value: mins,
				onChange: (e) => setMins(e.target.value),
				inputMode: "numeric",
				className: "h-11 w-24 rounded-md border border-line bg-elevated px-3 font-mono text-sm tabular-nums focus:outline-none"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "submit",
				variant: "ghost",
				children: "Kur"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "flex flex-col gap-2",
			children: timers.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
				className: "text-sm text-muted",
				children: "Aktif sayaç yok."
			}) : timers.map((t) => {
				const left = Math.max(0, Math.ceil((t.endsAt - now.getTime()) / 1e3));
				const mm = String(Math.floor(left / 60)).padStart(2, "0");
				const ss = String(left % 60).padStart(2, "0");
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center justify-between rounded-md border border-line bg-elevated px-3 py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-mono text-lg tabular-nums",
						children: [
							mm,
							":",
							ss
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: t.label
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => removeTimer(t.id),
						className: "text-subtle hover:text-fg",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
					})]
				}, t.id);
			})
		})]
	});
}
var KEYS = [
	"7",
	"8",
	"9",
	"/",
	"4",
	"5",
	"6",
	"*",
	"1",
	"2",
	"3",
	"-",
	"0",
	".",
	"=",
	"+"
];
function CalcPanel() {
	const value = useJarvis((s) => s.calcValue);
	const setCalcValue = useJarvis((s) => s.setCalcValue);
	const [expr, setExpr] = (0, import_react.useState)(value === "0" ? "" : value);
	const press = (k) => {
		if (k === "=") {
			try {
				const r = evalMath(expr || value);
				setCalcValue(r);
				setExpr(r);
			} catch {
				setCalcValue("—");
			}
			return;
		}
		const next = (expr === "0" ? "" : expr) + k;
		setExpr(next);
		setCalcValue(next);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "rounded-md border border-line bg-elevated px-3 py-3 text-right font-mono text-2xl tabular-nums",
			children: value
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-4 gap-1.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "col-span-2 h-11 rounded-md border border-line text-sm text-muted hover:bg-elevated",
				onClick: () => {
					setExpr("");
					setCalcValue("0");
				},
				children: "C"
			}), KEYS.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => press(k),
				className: "h-11 rounded-md border border-line text-sm hover:bg-elevated",
				children: k
			}, k))]
		})]
	});
}
function MapsPanel() {
	const query = useJarvis((s) => s.mapQuery);
	const setMapQuery = useJarvis((s) => s.setMapQuery);
	const [draft, setDraft] = (0, import_react.useState)(query);
	const src = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=11&output=embed`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-64 flex-col gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "flex gap-2",
			onSubmit: (e) => {
				e.preventDefault();
				if (draft.trim()) setMapQuery(draft.trim());
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				value: draft,
				onChange: (e) => setDraft(e.target.value),
				placeholder: "Şehir veya adres",
				className: "h-11 flex-1 rounded-md border border-line bg-elevated px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "submit",
				variant: "ghost",
				children: "Git"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
			title: "Harita",
			src,
			className: "min-h-52 flex-1 rounded-md border border-line"
		})]
	});
}
function FeedPanel() {
	const [stories, setStories] = (0, import_react.useState)(null);
	const [err, setErr] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		let live = true;
		fetch("https://hn.algolia.com/api/v1/search?tags=front_page").then((r) => r.json()).then((body) => {
			if (!live) return;
			setStories((body.hits ?? []).filter((h) => h.title).slice(0, 10).map((h) => ({
				title: h.title,
				url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`
			})));
		}).catch(() => {
			if (live) setErr(true);
		});
		return () => {
			live = false;
		};
	}, []);
	if (err) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: "Akış alınamadı."
	});
	if (!stories) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: "Yükleniyor…"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "flex flex-col gap-2",
		children: stories.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
			href: s.url,
			target: "_blank",
			rel: "noreferrer",
			className: "block rounded-md border border-line bg-elevated px-3 py-2 text-sm leading-snug hover:border-accent/40",
			children: s.title
		}) }, s.url))
	});
}
function SettingsPanel() {
	const geminiKey = useJarvis((s) => s.geminiKey);
	const setGeminiKey = useJarvis((s) => s.setGeminiKey);
	const voiceEnabled = useJarvis((s) => s.voiceEnabled);
	const setVoiceEnabled = useJarvis((s) => s.setVoiceEnabled);
	const theme = useJarvis((s) => s.theme);
	const setTheme = useJarvis((s) => s.setTheme);
	const [draft, setDraft] = (0, import_react.useState)(geminiKey);
	const [status, setStatus] = (0, import_react.useState)(null);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-5 text-sm",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-[11px] tracking-[0.18em] text-subtle uppercase",
						children: "Google AI Studio"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-muted leading-relaxed",
						children: "Gemini anahtarını yapıştır. Boş bırakırsan Grok devreye girer. Anahtar yalnızca bu tarayıcıda durur."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "password",
						autoComplete: "off",
						value: draft,
						onChange: (e) => setDraft(e.target.value),
						placeholder: "AIza…",
						className: "h-11 rounded-md border border-line bg-elevated px-3 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-accent/40"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "accent",
							onClick: async () => {
								const key = draft.trim();
								setGeminiKey(key);
								if (!key) {
									setStatus("Anahtar silindi. Grok kullanılacak.");
									return;
								}
								setStatus("Kontrol ediliyor…");
								const ok = await probeGemini(key);
								setStatus(ok ? "Gemini bağlı." : "Anahtar reddedildi. Yine de kaydedildi.");
							},
							children: "Kaydet"
						}), status ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "self-center text-muted",
							children: status
						}) : null]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Sesli yanıt" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "checkbox",
					checked: voiceEnabled,
					onChange: (e) => setVoiceEnabled(e.target.checked),
					className: "size-4 accent-accent"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted",
					children: "Tema"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex gap-1",
					children: [
						"night",
						"dim",
						"bright"
					].map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setTheme(m),
						className: cn("h-11 flex-1 rounded-md border border-line text-xs uppercase tracking-[0.14em]", theme === m && "bg-elevated text-fg", theme !== m && "text-muted"),
						children: m === "night" ? "Gece" : m === "dim" ? "Loş" : "Açık"
					}, m))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs leading-relaxed text-subtle",
				children: "JARVIS tarayıcıda çalışır: müzik, siteler, not, hava, zamanlayıcı, harita. Bilgisayarındaki masaüstü programlarını açamaz — tarayıcı güvenliği buna izin vermez."
			})
		]
	});
}
function LogPanel() {
	const messages = useJarvis((s) => s.messages);
	const reversed = (0, import_react.useMemo)(() => [...messages].reverse(), [messages]);
	if (!reversed.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: "Konuşma yok."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "flex max-h-80 flex-col gap-3 overflow-auto",
		children: reversed.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-mono text-[10px] tracking-[0.16em] text-subtle uppercase",
			children: m.role === "user" ? "Sen" : "Jarvis"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm leading-relaxed",
			children: m.text
		})] }, m.id))
	});
}
function WindowLayer() {
	const windows = useJarvis((s) => s.windows);
	const closeWindow = useJarvis((s) => s.closeWindow);
	const focusWindow = useJarvis((s) => s.focusWindow);
	const openWindow = useJarvis((s) => s.openWindow);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-none absolute top-4 right-4 z-30 hidden gap-1 md:flex",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
			label: "Günlük",
			onClick: () => openWindow("log"),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollText, { className: "size-4" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconBtn, {
			label: "Ayarlar",
			onClick: () => openWindow("settings"),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "size-4" })
		})]
	}), windows.map((w) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HudWindow, {
		id: w.id,
		x: w.x,
		y: w.y,
		z: w.z,
		onClose: () => closeWindow(w.id),
		onFocus: () => focusWindow(w.id)
	}, w.id))] });
}
function IconBtn({ label, onClick, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		title: label,
		onClick,
		className: "pointer-events-auto flex size-11 items-center justify-center rounded-md border border-line bg-surface text-muted hover:text-fg",
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: label
		})]
	});
}
function HudWindow({ id, x, y, z, onClose, onFocus }) {
	const meta = APP_META[id];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		role: "dialog",
		"aria-label": meta.title,
		onPointerDown: onFocus,
		style: {
			zIndex: 20 + z,
			top: y,
			left: x
		},
		className: cn("fixed flex max-h-[min(78vh,640px)] w-[min(92vw,420px)] flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-[0_24px_60px_rgba(0,0,0,0.45)]", "max-md:!inset-x-3 max-md:!top-16 max-md:!bottom-36 max-md:!w-auto max-md:!max-h-none"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex h-12 shrink-0 items-center justify-between border-b border-line px-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-medium",
				children: meta.title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[10px] tracking-[0.14em] text-subtle uppercase",
				children: meta.hint
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: onClose,
				className: "flex size-11 items-center justify-center rounded-md text-muted hover:text-fg",
				"aria-label": "Kapat",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "min-h-0 flex-1 overflow-auto p-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppPanel, { id })
		})]
	});
}
function JarvisApp() {
	const phase = useJarvis((s) => s.phase);
	const booted = useJarvis((s) => s.booted);
	const hydrated = useJarvis((s) => s.hydrated);
	const lastHeard = useJarvis((s) => s.lastHeard);
	const lastSpoke = useJarvis((s) => s.lastSpoke);
	const theme = useJarvis((s) => s.theme);
	const error = useJarvis((s) => s.error);
	const voiceEnabled = useJarvis((s) => s.voiceEnabled);
	const [draft, setDraft] = (0, import_react.useState)("");
	const recogRef = (0, import_react.useRef)(null);
	const listeningRef = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		const t = window.setTimeout(() => {
			if (!useJarvis.getState().hydrated) useJarvis.getState().setHydrated();
		}, 80);
		return () => window.clearTimeout(t);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!hydrated || booted) return;
		const t = window.setTimeout(() => {
			useJarvis.getState().finishBoot();
			useJarvis.getState().setLastSpoke("Sistemler çevrimiçi. Dinliyorum.");
		}, 1100);
		return () => window.clearTimeout(t);
	}, [hydrated, booted]);
	(0, import_react.useEffect)(() => {
		warmVoices();
		fetchWeather().then((w) => useJarvis.getState().setWeather(w)).catch(() => void 0);
	}, []);
	(0, import_react.useEffect)(() => {
		const id = window.setInterval(() => {
			const { timers, removeTimer } = useJarvis.getState();
			const due = timers.filter((t) => t.endsAt <= Date.now());
			if (!due.length) return;
			for (const t of due) removeTimer(t.id);
			const line = due.length === 1 ? `${due[0]?.label ?? "Sayaç"} doldu.` : "Sayaçlar doldu.";
			useJarvis.getState().setLastSpoke(line);
			if (useJarvis.getState().voiceEnabled) speakText(line);
		}, 400);
		return () => window.clearInterval(id);
	}, []);
	const speakOut = (0, import_react.useCallback)((text) => {
		useJarvis.getState().setLastSpoke(text);
		if (!voiceEnabled) {
			useJarvis.getState().setPhase("idle");
			return;
		}
		useJarvis.getState().setPhase("speaking");
		speakText(text, () => {
			if (useJarvis.getState().phase === "speaking") useJarvis.getState().setPhase("idle");
		});
	}, [voiceEnabled]);
	const handleUtterance = (0, import_react.useCallback)(async (text) => {
		const trimmed = text.trim();
		if (!trimmed) return;
		silence();
		const store = useJarvis.getState();
		store.setError(null);
		store.setLastHeard(trimmed);
		store.pushMessage({
			id: uid("u"),
			role: "user",
			text: trimmed,
			at: Date.now()
		});
		store.setPhase("thinking");
		try {
			const spoken = await runReply(await interpret(trimmed));
			store.pushMessage({
				id: uid("j"),
				role: "jarvis",
				text: spoken,
				at: Date.now()
			});
			speakOut(spoken);
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Bir şey ters gitti.";
			store.setError(msg);
			speakOut("Bunu şu an yapamadım.");
		}
	}, [speakOut]);
	const stopListen = (0, import_react.useCallback)(() => {
		listeningRef.current = false;
		recogRef.current?.stop();
		if (useJarvis.getState().phase === "listening") useJarvis.getState().setPhase("idle");
	}, []);
	const startListen = (0, import_react.useCallback)(() => {
		const Ctor = getRecogCtor();
		if (!Ctor) {
			useJarvis.getState().setError("Bu tarayıcı ses tanımayı desteklemiyor. Yazarak komut ver.");
			return;
		}
		silence();
		const recog = new Ctor();
		recog.lang = "tr-TR";
		recog.continuous = false;
		recog.interimResults = true;
		recog.onresult = (ev) => {
			let finalText = "";
			let interim = "";
			for (let i = ev.resultIndex; i < ev.results.length; i += 1) {
				const row = ev.results[i];
				if (!row) continue;
				if (row.isFinal) finalText += row[0].transcript;
				else interim += row[0].transcript;
			}
			if (interim) useJarvis.getState().setLastHeard(interim);
			if (finalText.trim()) {
				listeningRef.current = false;
				handleUtterance(finalText);
			}
		};
		recog.onerror = (ev) => {
			if (ev.error === "not-allowed") useJarvis.getState().setError("Mikrofon izni gerekli. Yazarak da komut verebilirsin.");
			stopListen();
		};
		recog.onend = () => {
			if (listeningRef.current) try {
				recog.start();
			} catch {
				stopListen();
			}
			else if (useJarvis.getState().phase === "listening") useJarvis.getState().setPhase("idle");
		};
		recogRef.current = recog;
		listeningRef.current = true;
		useJarvis.getState().setPhase("listening");
		try {
			recog.start();
		} catch {
			useJarvis.getState().setError("Mikrofon başlatılamadı.");
			stopListen();
		}
	}, [handleUtterance, stopListen]);
	const toggleListen = (0, import_react.useCallback)(() => {
		if (useJarvis.getState().phase === "listening") stopListen();
		else startListen();
	}, [startListen, stopListen]);
	(0, import_react.useEffect)(() => {
		const onKey = (e) => {
			if (e.key === "Escape") useJarvis.getState().closeTopWindow();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);
	const busy = phase === "thinking" || phase === "speaking";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		"data-theme": theme,
		className: "relative min-h-dvh overflow-hidden bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "hud-grid pointer-events-none absolute inset-0 opacity-70" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "hud-vignette pointer-events-none absolute inset-0" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Corners, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MusicEngine, {}),
			!booted ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 flex min-h-dvh flex-col items-center justify-center gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "stagger-in font-mono text-xs tracking-[0.42em] text-subtle uppercase",
						children: "J.A.R.V.I.S."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "stagger-in font-mono text-[11px] tracking-[0.24em] text-muted uppercase",
						style: { animationDelay: "120ms" },
						children: "Sistem başlatılıyor"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "stagger-in mt-4 h-px w-32 overflow-hidden bg-line",
						style: { animationDelay: "180ms" },
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "shimmer block h-full w-full" })
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 mx-auto flex min-h-dvh max-w-6xl flex-col gap-6 px-4 py-5 md:px-8 md:py-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-1 items-stretch gap-8",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusRail, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex min-w-0 flex-1 flex-col items-center justify-center gap-6",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Orb, {
										phase,
										onToggle: toggleListen
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex min-h-20 max-w-lg flex-col items-center gap-2 text-center",
										children: [
											lastHeard ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-subtle",
												children: lastHeard
											}) : null,
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: cn("text-lg font-medium leading-snug text-fg md:text-xl", phase === "thinking" && "text-muted"),
												children: phase === "thinking" ? "Düşünüyorum…" : lastSpoke || "Komutunu bekliyorum."
											}),
											error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-sm text-danger",
												children: error
											}) : null
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SuggestionChips, { onPick: (t) => {
										setDraft("");
										handleUtterance(t);
									} })
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "hidden w-44 shrink-0 flex-col items-end justify-between md:flex",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-right",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-mono text-[11px] tracking-[0.28em] text-subtle uppercase",
										children: "J.A.R.V.I.S."
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-2 text-xs text-muted",
										children: ["Ses tanıma ", canListen() ? "hazır" : "yok"]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "flex size-11 items-center justify-center rounded-md border border-line text-muted hover:text-fg",
									onClick: () => useJarvis.getState().openWindow("settings"),
									"aria-label": "Ayarlar",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "size-4" })
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex justify-center",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dock, {})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "md:hidden",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClockLine, {})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandBar, {
								value: draft,
								onChange: setDraft,
								onSubmit: (v) => {
									setDraft("");
									handleUtterance(v);
								},
								listening: phase === "listening",
								busy,
								onMic: toggleListen
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-center font-mono text-[10px] tracking-[0.16em] text-subtle uppercase",
								children: "Google AI Studio anahtarı · Ayarlar"
							})
						]
					})
				]
			}),
			booted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WindowLayer, {}) : null
		]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(JarvisApp, {});
}
//#endregion
export { Home as component };
