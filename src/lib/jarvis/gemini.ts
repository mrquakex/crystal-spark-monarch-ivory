import { SYSTEM_PROMPT } from "./prompt";
import type { ChatMessage, JarvisReply } from "./types";
import { parseModelJson } from "./parse";

const MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-flash-latest"];

type Content = { role: "user" | "model"; parts: { text: string }[] };

function toContents(messages: ChatMessage[]): Content[] {
  return messages.slice(-8).map((m) => ({
    role: m.role === "jarvis" ? "model" : "user",
    parts: [{ text: m.text }],
  }));
}

export async function askGemini(
  key: string,
  messages: ChatMessage[],
  context: string,
): Promise<JarvisReply> {
  let lastErr = "Gemini yanıt vermedi";
  for (const model of MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: `${SYSTEM_PROMPT}\n${context}` }] },
          contents: toContents(messages),
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 400,
            responseMimeType: "application/json",
          },
        }),
      });
      if (!res.ok) {
        lastErr = `Gemini ${res.status}`;
        continue;
      }
      const body = (await res.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
      };
      const text = body.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
      return parseModelJson(text);
    } catch (err) {
      lastErr = err instanceof Error ? err.message : "Gemini hatası";
    }
  }
  throw new Error(lastErr);
}

export async function probeGemini(key: string): Promise<boolean> {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`;
    const res = await fetch(url);
    return res.ok;
  } catch {
    return false;
  }
}
