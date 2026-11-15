export function extractCursorPrompt(content: string): string | null {
  const cursor = content.match(/```cursor\s*([\s\S]*?)```/);
  if (cursor) return cursor[1].trim();
  if (/prompt cursor/i.test(content)) {
    const any = content.match(/```[a-zA-Z]*\s*([\s\S]*?)```/);
    if (any) return any[1].trim();
  }
  return null;
}

export function speechText(content: string): string {
  return content
    .replace(/```[\s\S]*?```/g, " Le prompt est prêt à copier. ")
    .replace(/[#>*_]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function splitRichText(content: string): Array<{ kind: "text" | "code"; value: string }> {
  const parts = content.split("```");
  return parts.map((part, index) => {
    if (index % 2 === 0) return { kind: "text" as const, value: part };
    const breakAt = part.indexOf("\n");
    const value = breakAt === -1 ? part.replace(/^cursor\s*/i, "") : part.slice(breakAt + 1);
    return { kind: "code" as const, value };
  }).filter((part) => part.value.length > 0);
}
