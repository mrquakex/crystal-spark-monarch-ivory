import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
import { t as parseModelJson } from "./parse-D17yVsU9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/xai-Dq6EMkj_.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var askGrok_createServerFn_handler = createServerRpc({
	id: "818723433dd5250f83fe230bd82594e511b8ba46423de9109b2e3faebc57c290",
	name: "askGrok",
	filename: "src/lib/jarvis/xai.ts"
}, (opts) => askGrok.__executeServer(opts));
var askGrok = createServerFn({ method: "POST" }).validator((input) => input).handler(askGrok_createServerFn_handler, async ({ data }) => {
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey) return {
		ok: false,
		error: "AI bu ortamda yok"
	};
	const messages = [{
		role: "system",
		content: data.system
	}, ...data.messages.slice(-8).map((m) => ({
		role: m.role === "jarvis" ? "assistant" : "user",
		content: m.text
	}))];
	const res = await fetch("https://api.x.ai/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`
		},
		body: JSON.stringify({
			model: "grok-4.5",
			messages,
			temperature: .4,
			max_tokens: 400
		})
	});
	if (!res.ok) return {
		ok: false,
		error: `xAI ${res.status}`
	};
	const text = (await res.json()).choices?.[0]?.message?.content ?? "";
	return {
		ok: true,
		reply: parseModelJson(text)
	};
});
//#endregion
export { askGrok_createServerFn_handler };
