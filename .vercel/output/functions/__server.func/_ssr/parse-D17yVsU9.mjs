//#region node_modules/.nitro/vite/services/ssr/assets/parse-D17yVsU9.js
var APPS = /* @__PURE__ */ new Set([
	"music",
	"weather",
	"notes",
	"browser",
	"timer",
	"calc",
	"maps",
	"feed",
	"settings",
	"log"
]);
function asAction(raw) {
	if (!raw || typeof raw !== "object") return null;
	const o = raw;
	const type = String(o.type ?? "");
	switch (type) {
		case "play_music": return {
			type,
			query: String(o.query ?? "chill")
		};
		case "pause_music":
		case "resume_music":
		case "stop_music": return { type };
		case "set_volume": return {
			type,
			level: Number(o.level ?? 70)
		};
		case "open_app":
		case "close_app": {
			const app = String(o.app ?? "");
			if (!APPS.has(app)) return null;
			return {
				type,
				app
			};
		}
		case "close_top": return { type };
		case "open_url": return {
			type,
			url: String(o.url ?? ""),
			title: o.title ? String(o.title) : void 0
		};
		case "search_web": return {
			type,
			query: String(o.query ?? "")
		};
		case "set_timer": return {
			type,
			seconds: Number(o.seconds ?? 60),
			label: o.label ? String(o.label) : void 0
		};
		case "add_note": return {
			type,
			text: String(o.text ?? "")
		};
		case "weather": return {
			type,
			city: o.city ? String(o.city) : void 0
		};
		case "set_theme": return {
			type,
			mode: o.mode === "bright" || o.mode === "dim" ? o.mode : "night"
		};
		case "calculate": return {
			type,
			expression: String(o.expression ?? "")
		};
		default: return null;
	}
}
function parseModelJson(text) {
	const trimmed = text.trim();
	const blob = (trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)?.[1] ?? trimmed).trim();
	try {
		const parsed = JSON.parse(blob);
		const actions = Array.isArray(parsed.actions) ? parsed.actions.map(asAction).filter((a) => a !== null) : [];
		return {
			speak: String(parsed.speak ?? "").trim() || "Tamam.",
			actions
		};
	} catch {
		return {
			speak: trimmed.slice(0, 280) || "Tamam.",
			actions: []
		};
	}
}
//#endregion
export { parseModelJson as t };
