"use client";

import { useEffect, useRef, useState } from "react";
import { AngelPortrait } from "@/components/angel/AngelPortrait";
import { useAngel, type AngelMessage } from "@/components/angel/useAngel";
import { useSite } from "@/components/site/SiteContext";
import { speechState } from "@/lib/angel/speech";
import { extractCursorPrompt, splitRichText } from "@/lib/angel/text";

export function AngelPanel() {
  const { angelOpen, setAngelOpen } = useSite();
  const angel = useAngel();
  const scroller = useRef<HTMLDivElement>(null);
  const [dismissed, setDismissed] = useState(false);
  const lastId = angel.messages[angel.messages.length - 1]?.id;

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [angel.messages, angel.pending]);

  if (!angelOpen) {
    if (!dismissed) return null;
    return (
      <button
        type="button"
        className="fixed bottom-4 right-4 z-50"
        onClick={() => setAngelOpen(true)}
        aria-label="Ouvrir Angel"
      >
        <AngelPortrait speaking={false} size={72} />
      </button>
    );
  }

  return (
    <section className="fixed bottom-3 right-3 z-50 flex max-h-[min(680px,calc(100vh-96px))] w-[min(420px,calc(100vw-24px))] flex-col border border-cyan/50 bg-[#07080ea6] shadow-neon backdrop-blur-md" aria-label="Angel">
      <header className="flex items-center gap-3 border-b border-white/10 px-3 py-2">
        <AngelPortrait speaking={angel.speaking} size={58} />
        <div className="min-w-0 flex-1">
          <p className="font-mono text-sm text-white">ANGEL</p>
          <p className="truncate font-mono text-[10px] text-cyan">Powertech The Future · {angel.mode === "studio" ? angel.engine : "en ligne"}</p>
          <button type="button" onClick={angel.switchMode} className="mt-1 font-mono text-[10px] tracking-[0.04em] text-mute">
            <span>[MODE : </span>
            <span className={angel.mode === "public" ? "text-matrix" : "opacity-40"}>CLIENTS</span>
            <span> / </span>
            <span className={angel.mode === "studio" ? "text-cyan" : "opacity-40"}>STUDIO THOMAS</span>
            <span>]</span>
          </button>
        </div>
        <button type="button" className="font-mono text-xs text-mute" onClick={() => { setDismissed(true); setAngelOpen(false); }} aria-label="Réduire Angel">
          ✕
        </button>
      </header>
      <div ref={scroller} className="flex-1 space-y-3 overflow-auto px-3 py-3" aria-live="polite">
        {angel.messages.map((message) => (
          <Bubble
            key={message.id}
            message={message}
            animate={message.role === "assistant" && message.id === lastId}
            copied={angel.copiedId === message.id}
            onCopy={() => void angel.copyPrompt(message)}
          />
        ))}
        {angel.pending && <Analyse />}
      </div>
      <div className="flex flex-wrap gap-1 px-3">
        {angel.quick.map((action) => (
          <button key={action.label} type="button" className="border border-white/15 px-2 py-1 font-mono text-[10px] text-cyan" onClick={() => void angel.send(action.text)}>
            {action.label}
          </button>
        ))}
      </div>
      <form
        className="flex items-end gap-2 p-3"
        onSubmit={(event) => {
          event.preventDefault();
          void angel.send(angel.draft);
        }}
      >
        <label className="sr-only" htmlFor="angel-input">Message pour Angel</label>
        <textarea
          id="angel-input"
          value={angel.draft}
          dir="auto"
          rows={2}
          onChange={(event) => angel.setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void angel.send(angel.draft);
            }
          }}
          placeholder="Écrire à Angel"
          className="max-h-28 flex-1 resize-none border border-white/15 bg-transparent px-2 py-2 font-body text-sm text-white outline-none"
        />
        <div className="flex flex-col gap-1">
          <button type="button" aria-pressed={angel.listening} onClick={angel.toggleMic} className={`border px-2 py-1 font-mono text-[10px] ${angel.listening ? "border-magenta text-magenta" : "border-cyan text-cyan"}`}>
            {angel.listening ? <span className="mic-waves" aria-hidden><i /><i /><i /><i /></span> : "MIC"}
          </button>
          <button type="button" aria-pressed={angel.voiceOn} onClick={angel.toggleVoice} className="border border-white/20 px-2 py-1 font-mono text-[10px] text-mute">
            {angel.voiceOn ? "Voix activée" : "Muet"}
          </button>
          <button type="submit" className="bg-matrix px-2 py-1 font-mono text-[10px] text-void">OK</button>
        </div>
      </form>
      <div className="flex items-center justify-between gap-2 border-t border-white/10 px-3 py-2">
        <button type="button" onClick={() => void angel.transmit()} className="font-mono text-[10px] text-magenta">
          Transmettre ce dossier à Thomas
        </button>
        {angel.notice && <p className="truncate font-mono text-[10px] text-matrix">{angel.notice}</p>}
      </div>
    </section>
  );
}

function Bubble({
  message,
  animate,
  copied,
  onCopy,
}: {
  message: AngelMessage;
  animate: boolean;
  copied: boolean;
  onCopy: () => void;
}) {
  const shown = useTypewriter(message.content, message.id, animate);
  const done = shown.length === message.content.length;
  const prompt = extractCursorPrompt(message.content);
  const mine = message.role === "user";
  return (
    <div className={`flex gap-2 ${mine ? "flex-row-reverse" : ""}`} dir="auto">
      {!mine && <AngelPortrait speaking={false} size={28} />}
      <div className={`max-w-[85%] border px-2 py-2 text-sm leading-relaxed ${mine ? "border-cyan/40 text-white" : "border-matrix/30 text-ink"}`}>
        {splitRichText(shown).map((part, index) => part.kind === "code" ? (
          <pre key={index} className="mt-2 overflow-auto bg-black/70 p-2 font-mono text-[11px] text-matrix">{part.value}</pre>
        ) : (
          <p key={index} className="whitespace-pre-wrap font-body">{part.value}</p>
        ))}
        {!mine && done && prompt && (
          <button type="button" onClick={onCopy} className="mt-2 border border-cyan/50 px-2 py-1 font-mono text-[10px] text-cyan">
            {copied ? "Prompt copié" : "Copier le prompt en 1 clic"}
          </button>
        )}
      </div>
    </div>
  );
}

function useTypewriter(text: string, id: string, active: boolean) {
  const [count, setCount] = useState(active ? 0 : text.length);
  useEffect(() => {
    if (!active) {
      setCount(text.length);
      return;
    }
    let frame = 0;
    const started = performance.now();
    const step = (now: number) => {
      const speech = speechState.id === id && speechState.active ? speechState.ratio : -1;
      const timed = Math.min(1, (now - started) / Math.max(800, text.length * 28));
      const ratio = speech > 0.04 ? Math.max(speech, timed) : timed;
      const next = Math.min(text.length, Math.floor(ratio * text.length));
      setCount(next);
      if (next < text.length) frame = requestAnimationFrame(step);
    };
    setCount(0);
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [active, id, text]);
  return text.slice(0, count);
}

function Analyse() {
  const [bits, setBits] = useState("01101");
  useEffect(() => {
    const timer = window.setInterval(() => {
      setBits(Array.from({ length: 5 }, () => (Math.random() > 0.5 ? "1" : "0")).join(""));
    }, 120);
    return () => window.clearInterval(timer);
  }, []);
  return <p className="font-mono text-[11px] tracking-[0.12em] text-cyan">[ANGEL ANALYSE... {bits}]</p>;
}
