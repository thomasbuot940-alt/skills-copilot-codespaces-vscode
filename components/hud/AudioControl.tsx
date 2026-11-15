"use client";

import { useEffect, useRef, useState } from "react";
import { getAudioEngine } from "@/lib/audio/AudioEngine";

export function AudioControl() {
  const [on, setOn] = useState(true);
  const [volume, setVolume] = useState(0.72);
  const bars = useRef<Array<HTMLSpanElement | null>>([]);

  useEffect(() => getAudioEngine().subscribe(() => {
    const engine = getAudioEngine();
    setOn(engine.isDesired());
    setVolume(engine.getVolume());
  }), []);

  useEffect(() => {
    const data = new Uint8Array(32);
    let frame = 0;
    const loop = () => {
      const engine = getAudioEngine();
      const analyser = engine.getAnalyser();
      if (analyser && engine.isRunning()) {
        analyser.getByteFrequencyData(data);
        bars.current.forEach((bar, index) => {
          if (!bar) return;
          const value = data[index * 3] / 255;
          bar.style.transform = `scaleY(${0.18 + value * 1.15})`;
        });
      } else {
        bars.current.forEach((bar) => {
          if (bar) bar.style.transform = "scaleY(0.18)";
        });
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="flex items-center gap-2 border border-matrix/40 bg-black/40 px-2 py-1">
      <button
        type="button"
        className="font-mono text-[10px] tracking-[0.14em] text-matrix"
        aria-pressed={on}
        onClick={() => {
          void getAudioEngine().toggle();
          getAudioEngine().play("click");
        }}
      >
        {on ? "SOUND ON" : "SOUND OFF"}
      </button>
      <span className="flex h-4 items-end gap-0.5" aria-hidden>
        {Array.from({ length: 5 }, (_, index) => (
          <span key={index} ref={(node) => { bars.current[index] = node; }} className="eq-bar" />
        ))}
      </span>
      <label className="sr-only" htmlFor="volume">Volume</label>
      <input
        id="volume"
        type="range"
        min={0}
        max={100}
        value={Math.round(volume * 100)}
        onChange={(event) => getAudioEngine().setVolume(Number(event.target.value) / 100)}
        className="h-1 w-16 accent-cyan"
      />
    </div>
  );
}
