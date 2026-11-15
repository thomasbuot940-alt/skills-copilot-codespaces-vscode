export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Stored = { reference: string; at: string; mode: string; intent: string; transcript: string };

const memory: Stored[] = [];

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const messages = Array.isArray(body?.messages) ? body.messages : [];
  const lines = messages
    .filter((item: { role?: unknown; content?: unknown }) => (item?.role === "user" || item?.role === "assistant") && typeof item.content === "string")
    .slice(-30)
    .map((item: { role: string; content: string }) => `${item.role === "user" ? "Visiteur" : "Angel"}: ${item.content.slice(0, 4000)}`);
  const transcript = lines.join("\n\n").slice(0, 100_000);
  if (!transcript) return Response.json({ error: "Dossier vide." }, { status: 400 });
  const reference = `PT-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  memory.push({
    reference,
    at: new Date().toISOString(),
    mode: body?.mode === "studio" ? "studio" : "public",
    intent: body?.intent === "recruit" ? "recruit" : "client",
    transcript,
  });
  if (memory.length > 50) memory.shift();
  return Response.json({ ok: true, reference });
}
