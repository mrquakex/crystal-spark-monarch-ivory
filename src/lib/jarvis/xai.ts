import { createServerFn } from "@tanstack/react-start";
import { parseModelJson } from "./parse";
import type { ChatMessage, JarvisReply } from "./types";

export const askGrok = createServerFn({ method: "POST" })
  .validator((input: { system: string; messages: { role: string; text: string }[] }) => input)
  .handler(async ({ data }): Promise<{ ok: true; reply: JarvisReply } | { ok: false; error: string }> => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false, error: "AI bu ortamda yok" };

    const messages = [
      { role: "system", content: data.system },
      ...data.messages.slice(-8).map((m) => ({
        role: m.role === "jarvis" ? "assistant" : "user",
        content: m.text,
      })),
    ];

    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        messages,
        temperature: 0.4,
        max_tokens: 400,
      }),
    });

    if (!res.ok) return { ok: false, error: `xAI ${res.status}` };

    const body = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = body.choices?.[0]?.message?.content ?? "";
    return { ok: true, reply: parseModelJson(text) };
  });

export async function askGrokClient(
  messages: ChatMessage[],
  system: string,
): Promise<JarvisReply> {
  const result = await askGrok({
    data: {
      system,
      messages: messages.map((m) => ({ role: m.role, text: m.text })),
    },
  });
  if (!result.ok) throw new Error(result.error);
  return result.reply;
}
