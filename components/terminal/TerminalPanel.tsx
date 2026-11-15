"use client";

import { useEffect, useRef, useState } from "react";
import { useSite } from "@/components/site/SiteContext";
import { getAudioEngine } from "@/lib/audio/AudioEngine";
import { createEnv, PyError, runLine, type Env } from "@/lib/terminal/python";

type Line = { kind: "in" | "out" | "err" | "sys"; text: string };

const BOOT: Line[] = [
  { kind: "sys", text: "POWERTECH THE FUTURE" },
  { kind: "sys", text: "PYTHON ENGINEERING // AI, 3D & WEB SYSTEMS" },
  { kind: "out", text: "kernel prêt — sous-ensemble Python actif. Tapez help." },
];

export function TerminalPanel() {
  const { setView, openAngel } = useSite();
  const [lines, setLines] = useState<Line[]>(BOOT);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState(-1);
  const envRef = useRef<Env>(createEnv());
  const scroller = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [lines]);

  const push = (next: Line[]) => setLines((current) => [...current, ...next].slice(-80));

  const run = (raw: string) => {
    const command = raw.trim();
    push([{ kind: "in", text: command }]);
    if (!command) return;
    setHistory((current) => [...current, command]);
    setCursor(-1);
    const [head, ...rest] = command.split(/\s+/);
    const arg = rest.join(" ");
    if (head === "help") {
      push([{ kind: "out", text: "help  about  stack  offers  method  angel  demo  clear\npuis n'importe quelle expression Python : print, variables, + - * / // % **" }]);
      return;
    }
    if (head === "clear") {
      envRef.current = createEnv();
      setLines(BOOT);
      return;
    }
    if (head === "about") {
      push([{ kind: "out", text: "Thomas — Powertech The Future.\nPython, IA, systèmes web. 100 % en ligne, sans appel obligatoire.\nTJM missions : 350 €/jour." }]);
      return;
    }
    if (head === "stack") {
      push([{ kind: "out", text: "Python · TypeScript · Next.js · Web Audio · Canvas · IA générative pilotée" }]);
      return;
    }
    if (head === "offers") {
      push([{ kind: "out", text: "Starter 149 €  |  Pro 397 € (ou 2x 209 €)  |  Enterprise 797 €\nMaintenance 49 €/mois. Ouverture de l'onglet Offres." }]);
      setView("offers");
      return;
    }
    if (head === "method") {
      push([{ kind: "out", text: "Méthode : IA générative pilotée + architecture Python + relecture humaine." }]);
      setView("method");
      return;
    }
    if (head === "angel") {
      push([{ kind: "out", text: "Angel est au premier plan." }]);
      openAngel();
      return;
    }
    if (head === "demo") {
      const produced: Line[] = [];
      ["tjm = 350", "jours = 5", "print(tjm * jours)"].forEach((line) => {
        try {
          const result = runLine(line, envRef.current);
          produced.push({ kind: "in", text: line });
          if (result.output) produced.push({ kind: "out", text: result.output });
        } catch (error) {
          produced.push({ kind: "err", text: error instanceof PyError ? error.message : "Erreur" });
        }
      });
      push(produced);
      return;
    }
    try {
      const result = runLine(arg && head === "run" ? arg : command, envRef.current);
      if (result.output) push([{ kind: "out", text: result.output }]);
    } catch (error) {
      push([{ kind: "err", text: error instanceof PyError ? error.message : "Erreur d'exécution." }]);
    }
  };

  return (
    <section
      className="flex h-[460px] flex-col border border-matrix/40 bg-black/75 shadow-neon"
      onClick={() => inputRef.current?.focus()}
      data-cursor="text"
    >
      <header className="flex items-center justify-between border-b border-white/10 px-3 py-2 font-mono text-[10px] tracking-[0.18em] text-mute">
        <span>visitor@powertech:~</span>
        <span className="text-matrix">PYTHON 3 // SAFE REPL</span>
      </header>
      <div ref={scroller} className="flex-1 space-y-1 overflow-auto px-3 py-3 font-mono text-[13px] leading-relaxed">
        {lines.map((line, index) => (
          <p key={`${index}-${line.text.slice(0, 12)}`} className={line.kind === "err" ? "text-magenta" : line.kind === "sys" ? "text-cyan" : line.kind === "in" ? "text-white" : "text-matrix"}>
            {line.kind === "in" ? `› ${line.text}` : line.text}
          </p>
        ))}
        <form
          onSubmit={(event) => {
            event.preventDefault();
            getAudioEngine().play("click");
            run(value);
            setValue("");
          }}
        >
          <label className="flex items-center gap-2 text-white">
            <span className="text-magenta">›</span>
            <input
              ref={inputRef}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "ArrowUp") {
                  event.preventDefault();
                  const next = cursor < 0 ? history.length - 1 : Math.max(0, cursor - 1);
                  setCursor(next);
                  setValue(history[next] ?? "");
                }
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  const next = Math.min(history.length, cursor + 1);
                  setCursor(next);
                  setValue(history[next] ?? "");
                }
              }}
              aria-label="Commande du terminal"
              className="w-full bg-transparent font-mono text-[13px] text-white outline-none"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
            />
            <span className="term-caret" />
          </label>
        </form>
      </div>
    </section>
  );
}
