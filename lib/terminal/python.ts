export type Value = number | string | null;

export type Env = Record<string, Value>;

export function createEnv(): Env {
  return {};
}

export class PyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PyError";
  }
}

type Tok =
  | { k: "num"; v: number }
  | { k: "str"; v: string }
  | { k: "name"; v: string }
  | { k: "op"; v: string }
  | { k: "lp" }
  | { k: "rp" };

const BLOCKED = /^(import|from|def|class|for|while|lambda|exec|eval|open|global|nonlocal|yield|async|await|try|with|raise|del|assert)\b/;

function stripComment(line: string): string {
  let out = "";
  let quote: '"' | "'" | null = null;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (quote) {
      out += ch;
      if (ch === "\\" && i + 1 < line.length) {
        out += line[i + 1];
        i += 1;
        continue;
      }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      out += ch;
      continue;
    }
    if (ch === "#") break;
    out += ch;
  }
  return out;
}

function tokenize(source: string): Tok[] {
  const tokens: Tok[] = [];
  let i = 0;
  while (i < source.length) {
    const ch = source[i];
    if (ch === " " || ch === "\t") {
      i += 1;
      continue;
    }
    if (ch === "(") {
      tokens.push({ k: "lp" });
      i += 1;
      continue;
    }
    if (ch === ")") {
      tokens.push({ k: "rp" });
      i += 1;
      continue;
    }
    if (source.startsWith("**", i) || source.startsWith("//", i)) {
      tokens.push({ k: "op", v: source.slice(i, i + 2) });
      i += 2;
      continue;
    }
    if ("+-*/%,=".includes(ch)) {
      tokens.push({ k: "op", v: ch });
      i += 1;
      continue;
    }
    if (ch === '"' || ch === "'") {
      const quote = ch;
      let value = "";
      i += 1;
      while (i < source.length && source[i] !== quote) {
        if (source[i] === "\\" && i + 1 < source.length) {
          const next = source[i + 1];
          value += next === "n" ? "\n" : next;
          i += 2;
          continue;
        }
        value += source[i];
        i += 1;
      }
      if (source[i] !== quote) throw new PyError("Chaîne non fermée.");
      i += 1;
      tokens.push({ k: "str", v: value });
      continue;
    }
    if ((ch >= "0" && ch <= "9") || (ch === "." && source[i + 1] >= "0" && source[i + 1] <= "9")) {
      const start = i;
      i += 1;
      while (i < source.length && /[0-9.]/.test(source[i])) i += 1;
      const raw = source.slice(start, i);
      if (Number.isNaN(Number(raw))) throw new PyError(`Nombre illisible : ${raw}`);
      tokens.push({ k: "num", v: Number(raw) });
      continue;
    }
    if (/[A-Za-z_]/.test(ch)) {
      const start = i;
      i += 1;
      while (i < source.length && /[A-Za-z0-9_]/.test(source[i])) i += 1;
      tokens.push({ k: "name", v: source.slice(start, i) });
      continue;
    }
    throw new PyError(`Caractère inattendu : ${ch}`);
  }
  return tokens;
}

function num(value: Value, op: string): number {
  if (typeof value !== "number") throw new PyError(`TypeError : ${op} attend un nombre.`);
  return value;
}

function display(value: Value): string {
  if (value === null) return "None";
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return "inf";
    if (Number.isInteger(value)) return String(value);
    return String(Math.round(value * 10000) / 10000);
  }
  return value;
}

function repr(value: Value): string {
  if (typeof value === "string") return JSON.stringify(value);
  return display(value);
}

class Parser {
  i = 0;
  logs: string[] = [];

  constructor(
    private tokens: Tok[],
    private env: Env,
  ) {}

  parseExpr(): Value {
    return this.parseAdd();
  }

  end() {
    if (this.i < this.tokens.length) throw new PyError("Syntaxe incomplète.");
  }

  private peek(): Tok | undefined {
    return this.tokens[this.i];
  }

  private eat(): Tok {
    const tok = this.tokens[this.i];
    if (!tok) throw new PyError("Expression interrompue.");
    this.i += 1;
    return tok;
  }

  private checkOp(op: string): boolean {
    const tok = this.peek();
    return tok?.k === "op" && tok.v === op;
  }

  private parseAdd(): Value {
    let left = this.parseMul();
    while (this.checkOp("+") || this.checkOp("-")) {
      const op = (this.eat() as { v: string }).v;
      const right = this.parseMul();
      if (op === "+") {
        if (typeof left === "string" || typeof right === "string") {
          left = display(left) + display(right);
        } else left = num(left, "+") + num(right, "+");
      } else left = num(left, "-") - num(right, "-");
    }
    return left;
  }

  private parseMul(): Value {
    let left = this.parsePower();
    while (this.checkOp("*") || this.checkOp("/") || this.checkOp("//") || this.checkOp("%")) {
      const op = (this.eat() as { v: string }).v;
      const right = this.parsePower();
      if (op === "*") left = this.multiply(left, right);
      else if (op === "/") {
        const b = num(right, "/");
        if (b === 0) throw new PyError("ZeroDivisionError");
        left = num(left, "/") / b;
      } else if (op === "//") {
        const b = num(right, "//");
        if (b === 0) throw new PyError("ZeroDivisionError");
        left = Math.floor(num(left, "//") / b);
      } else {
        const b = num(right, "%");
        if (b === 0) throw new PyError("ZeroDivisionError");
        left = num(left, "%") % b;
      }
    }
    return left;
  }

  private multiply(left: Value, right: Value): Value {
    if (typeof left === "string" && typeof right === "number") return this.repeat(left, right);
    if (typeof right === "string" && typeof left === "number") return this.repeat(right, left);
    return num(left, "*") * num(right, "*");
  }

  private repeat(text: string, count: number): string {
    if (!Number.isInteger(count) || count < 0 || count > 200) {
      throw new PyError("La répétition de chaîne est limitée à un entier entre 0 et 200.");
    }
    return text.repeat(count);
  }

  private parsePower(): Value {
    const left = this.parseUnary();
    if (!this.checkOp("**")) return left;
    this.eat();
    const right = this.parsePower();
    return num(left, "**") ** num(right, "**");
  }

  private parseUnary(): Value {
    if (this.checkOp("-")) {
      this.eat();
      return -num(this.parseUnary(), "-");
    }
    if (this.checkOp("+")) {
      this.eat();
      return num(this.parseUnary(), "+");
    }
    return this.parsePrimary();
  }

  private parsePrimary(): Value {
    const tok = this.eat();
    if (tok.k === "num") return tok.v;
    if (tok.k === "str") return tok.v;
    if (tok.k === "lp") {
      const value = this.parseExpr();
      const close = this.eat();
      if (close.k !== "rp") throw new PyError("Parenthèse fermante manquante.");
      return value;
    }
    if (tok.k === "name") {
      if (tok.v === "print") return this.parsePrint();
      if (this.peek()?.k === "lp") throw new PyError(`${tok.v}() n'est pas disponible dans ce terminal. Utilisez print().`);
      if (!(tok.v in this.env)) throw new PyError(`NameError : ${tok.v}`);
      return this.env[tok.v];
    }
    throw new PyError("Expression attendue.");
  }

  private parsePrint(): Value {
    const open = this.eat();
    if (open.k !== "lp") throw new PyError("print attend des parenthèses.");
    const args: Value[] = [];
    if (this.peek()?.k !== "rp") {
      args.push(this.parseExpr());
      while (this.checkOp(",")) {
        this.eat();
        args.push(this.parseExpr());
      }
    }
    const close = this.eat();
    if (close.k !== "rp") throw new PyError("Parenthèse fermante manquante.");
    this.logs.push(args.map(display).join(" "));
    return null;
  }
}

export function runLine(line: string, env: Env): { output: string } {
  if (line.length > 500) throw new PyError("Ligne trop longue.");
  const source = stripComment(line).trim();
  if (!source) return { output: "" };
  if (BLOCKED.test(source)) {
    throw new PyError("Ce terminal exécute des expressions, des variables et print(). Les blocs et les imports restent dans le studio.");
  }
  const tokens = tokenize(source);
  const parser = new Parser(tokens, env);
  if (tokens.length >= 3 && tokens[0].k === "name" && tokens[1].k === "op" && tokens[1].v === "=") {
    const name = tokens[0].v;
    if (name === "print") throw new PyError("print est réservé.");
    parser.i = 2;
    const value = parser.parseExpr();
    parser.end();
    env[name] = value;
    return { output: "" };
  }
  const value = parser.parseExpr();
  parser.end();
  if (parser.logs.length) {
    const printed = parser.logs.join("\n");
    if (value === null) return { output: printed };
    return { output: `${printed}\n${repr(value)}` };
  }
  return { output: repr(value) };
}
