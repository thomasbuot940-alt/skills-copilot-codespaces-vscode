export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function elevenLabs(text: string): Promise<Response | null> {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) return null;
  const voice = process.env.ELEVENLABS_VOICE_ID || "EXAVITQu4vr4xnSDxMaL";
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
    method: "POST",
    headers: {
      "xi-api-key": key,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.45, similarity_boost: 0.75 },
    }),
  });
  if (!response.ok) return null;
  const audio = await response.arrayBuffer();
  return new Response(audio, { headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" } });
}

async function openAiSpeech(text: string): Promise<Response | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  const model = process.env.OPENAI_TTS_MODEL || "gpt-4o-mini-tts";
  const voice = process.env.OPENAI_TTS_VOICE || "coral";
  const attempt = async (nextModel: string, nextVoice: string) =>
    fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: nextModel, voice: nextVoice, input: text, response_format: "mp3" }),
    });
  let response = await attempt(model, voice);
  if (!response.ok && model !== "tts-1") response = await attempt("tts-1", "nova");
  if (!response.ok) return null;
  const audio = await response.arrayBuffer();
  return new Response(audio, { headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const text = String(body?.text ?? "").replace(/\s+/g, " ").trim().slice(0, 1500);
  if (!text) return Response.json({ fallback: true });
  const provider = body?.provider === "openai" ? "openai" : "elevenlabs";
  try {
    const audio = provider === "openai" ? await openAiSpeech(text) : await elevenLabs(text);
    if (audio) return audio;
  } catch (error) {
    console.error("Angel TTS failed", error instanceof Error ? error.name : "error");
  }
  return Response.json({ fallback: true });
}
