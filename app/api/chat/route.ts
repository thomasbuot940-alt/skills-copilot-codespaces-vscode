import { localAngelReply, type AngelMode, type ChatTurn } from "@/lib/angel/localBrain";
import { systemPromptFor } from "@/lib/angel/systemPrompt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const buckets = new Map<string, { n: number; t: number }>();

function limited(ip: string): boolean {
  const now = Date.now();
  const bucket = buckets.get(ip) ?? { n: 0, t: now };
  if (now - bucket.t > 60_000) {
    bucket.n = 0;
    bucket.t = now;
  }
  bucket.n += 1;
  buckets.set(ip, bucket);
  return bucket.n > 30;
}

function cleanMessages(input: unknown): ChatTurn[] {
  if (!Array.isArray(input)) return [];
  return input
    .filter((item): item is ChatTurn => {
      if (!item || typeof item !== "object") return false;
      const role = (item as { role?: unknown }).role;
      const content = (item as { content?: unknown }).content;
      return (role === "user" || role === "assistant") && typeof content === "string";
    })
    .slice(-12)
    .map((message) => ({ role: message.role, content: message.content.slice(0, 8000) }));
}

async function askGemini(system: string, messages: ChatTurn[]): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  const contents = messages.filter((message, index) => message.role === "user" || index > 0 || messages[0]?.role === "user");
  while (contents[0]?.role === "assistant") contents.shift();
  if (!contents.length) return null;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 25000);
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${encodeURIComponent(key)}`,
      {
        method: "POST",
        signal: ctrl.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: contents.map((message) => ({
            role: message.role === "assistant" ? "model" : "user",
            parts: [{ text: message.content }],
          })),
          generationConfig: { temperature: 0.6, maxOutputTokens: 2048 },
        }),
      },
    );
    if (!response.ok) {
      console.error("Angel Gemini HTTP", response.status);
      return null;
    }
    const data = await response.json();
    const parts = data.candidates?.[0]?.content?.parts ?? [];
    const text = parts
      .filter((part: { thought?: boolean; text?: string }) => !part.thought && part.text)
      .map((part: { text: string }) => part.text)
      .join("")
      .trim();
    return text || null;
  } catch (error) {
    console.error("Angel Gemini failed", error instanceof Error ? error.name : "error");
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function askOpenAI(system: string, messages: ChatTurn[]): Promise<string | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 25000);
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      signal: ctrl.signal,
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        temperature: 0.6,
        messages: [{ role: "system", content: system }, ...messages],
      }),
    });
    if (!response.ok) {
      console.error("Angel OpenAI HTTP", response.status);
      return null;
    }
    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;
    return typeof text === "string" && text.trim() ? text.trim() : null;
  } catch (error) {
    console.error("Angel OpenAI failed", error instanceof Error ? error.name : "error");
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (limited(ip)) return Response.json({ error: "Trop de messages. Réessayez dans une minute." }, { status: 429 });

  const body = await request.json().catch(() => null);
  const messages = cleanMessages(body?.messages);
  const mode: AngelMode = body?.mode === "studio" ? "studio" : "public";
  const intent = body?.intent === "recruit" ? "recruit" : "client";
  const system = systemPromptFor(mode, intent);

  const remote = (await askGemini(system, messages)) ?? (await askOpenAI(system, messages));
  if (remote) {
    const engine = process.env.GEMINI_API_KEY ? "gemini-2.5-pro" : "gpt-4o";
    return Response.json({ content: remote, engine, lang: null });
  }

  const local = localAngelReply(messages, { mode, intent });
  return Response.json({ content: local.content, engine: local.engine, lang: local.lang });
}
