"use client";

import { useEffect, useRef } from "react";
import { buildActivity } from "@/data/activity";

const CELLS = buildActivity();

export function ActivityGraph() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let frame = 0;
    const draw = (time: number) => {
      const width = canvas.clientWidth || 600;
      const height = canvas.clientHeight || 112;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const nextW = Math.floor(width * dpr);
      const nextH = Math.floor(height * dpr);
      if (canvas.width !== nextW || canvas.height !== nextH) {
        canvas.width = nextW;
        canvas.height = nextH;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const cols = 53;
      const rows = 7;
      const gap = 3;
      const size = Math.min((width - gap * cols) / cols, (height - gap * rows) / rows);
      const colors = ["#12151c", "#0c3b32", "#0e7a55", "#00c47a", "#00ff9d"];
      const sweep = ((time / 18) % (cols + 8)) - 4;
      for (let c = 0; c < cols; c += 1) {
        for (let r = 0; r < rows; r += 1) {
          const level = CELLS[c * rows + r] ?? 0;
          ctx.fillStyle = colors[level];
          const x = c * (size + gap);
          const y = r * (size + gap);
          ctx.fillRect(x, y, size, size);
          if (Math.abs(c - sweep) < 1.2) {
            ctx.fillStyle = "rgba(0,243,255,0.55)";
            ctx.fillRect(x, y, size, size);
          }
        }
      }
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, []);

  return <canvas ref={ref} className="h-28 w-full" aria-hidden />;
}
