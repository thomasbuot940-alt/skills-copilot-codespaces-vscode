"use client";

import { useEffect, useRef, useState } from "react";

const GLYPHS = "01ABCDEF";

export function DecryptText({ text, className = "" }: { text: string; className?: string }) {
  const [shown, setShown] = useState(text);
  const timer = useRef<number | null>(null);

  useEffect(() => () => {
    if (timer.current) window.clearInterval(timer.current);
  }, []);

  const play = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (timer.current) window.clearInterval(timer.current);
    let step = 0;
    timer.current = window.setInterval(() => {
      step += 1;
      setShown(text.split("").map((char, index) => {
        if (char === " ") return " ";
        if (index < step) return char;
        return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }).join(""));
      if (step >= text.length && timer.current) window.clearInterval(timer.current);
    }, 16);
  };

  return (
    <span className={className} onMouseEnter={play} onFocus={play}>
      {shown}
    </span>
  );
}
