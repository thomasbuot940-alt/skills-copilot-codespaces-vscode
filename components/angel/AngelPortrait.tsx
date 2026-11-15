"use client";

import { useEffect, useState } from "react";

export function AngelPortrait({ speaking, size = 64 }: { speaking: boolean; size?: number }) {
  const [failed, setFailed] = useState(false);
  const [halo, setHalo] = useState(0.4);

  useEffect(() => {
    if (!speaking) {
      setHalo(0.35);
      return;
    }
    let frame = 0;
    const loop = (time: number) => {
      setHalo(0.35 + Math.abs(Math.sin(time / 150) * Math.sin(time / 80)) * 0.65);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [speaking]);

  return (
    <div className={`angel-portrait shrink-0 ${speaking ? "is-speaking" : ""}`} style={{ width: size, height: size, ["--halo" as string]: String(halo) }}>
      {failed ? <AngelGlyph /> : (
        <img
          src="/angel-avatar.png"
          alt="Angel, assistante IA de Powertech The Future"
          width={size}
          height={size}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

function AngelGlyph() {
  return (
    <svg className="angel-glyph" viewBox="0 0 80 80" role="img" aria-label="Angel">
      <circle cx="40" cy="40" r="30" fill="#07080d" stroke="#00f3ff" />
      <path d="M22 38c4-14 32-14 36 0" fill="none" stroke="#7fd7ff" strokeWidth="3" />
      <circle cx="32" cy="42" r="2" fill="#d7f7ff" />
      <circle cx="48" cy="42" r="2" fill="#d7f7ff" />
      <path d="M34 52c4 3 8 3 12 0" fill="none" stroke="#ff7ab6" />
    </svg>
  );
}
