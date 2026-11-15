const KEYWORDS = new Set([
  "def", "return", "import", "from", "class", "if", "else", "elif", "for", "while", "in", "not",
  "and", "or", "None", "True", "False", "async", "await", "const", "let", "function", "type",
  "export", "interface", "new", "return", "void", "string", "number",
]);

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function highlight(code: string): string {
  const re = /(#.*$|\/\/.*$|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b\d+(?:\.\d+)?\b|\b[A-Za-z_][A-Za-z0-9_]*\b|[^#"'A-Za-z0-9_]+)/gm;
  const out: string[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(code))) {
    if (match.index > last) out.push(esc(code.slice(last, match.index)));
    const tok = match[0];
    last = match.index + tok.length;
    if (tok.startsWith("#") || tok.startsWith("//")) out.push(`<span class="tok-c">${esc(tok)}</span>`);
    else if (tok.startsWith('"') || tok.startsWith("'")) out.push(`<span class="tok-s">${esc(tok)}</span>`);
    else if (/^\d/.test(tok)) out.push(`<span class="tok-n">${esc(tok)}</span>`);
    else if (KEYWORDS.has(tok)) out.push(`<span class="tok-k">${esc(tok)}</span>`);
    else out.push(esc(tok));
  }
  if (last < code.length) out.push(esc(code.slice(last)));
  return out.join("");
}
