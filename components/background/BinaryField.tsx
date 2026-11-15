"use client";

import { useEffect, useRef } from "react";
import { pointer } from "@/lib/pointer";

type Column = { y: number; glyph: string; speed: number };

function paint(canvas: HTMLCanvasElement, columns: Column[], edge: boolean, reduce: boolean) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (width < 2 || height < 2) return;
  const nextW = Math.floor(width * dpr);
  const nextH = Math.floor(height * dpr);
  if (canvas.width !== nextW || canvas.height !== nextH) {
    canvas.width = nextW;
    canvas.height = nextH;
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = edge ? "rgba(5,5,8,0.32)" : "rgba(5,5,8,0.16)";
  ctx.fillRect(0, 0, width, height);
  const font = edge ? 13 : 15;
  ctx.font = `500 ${font}px var(--font-jetbrains), ui-monospace, monospace`;
  const rect = canvas.getBoundingClientRect();
  const localX = pointer.x - rect.left;
  const localY = pointer.y - rect.top;
  const pointerCol = Math.floor(localX / font);
  const needed = Math.max(1, Math.ceil(width / font));
  while (columns.length < needed) {
    columns.push({ y: Math.random() * height, glyph: Math.random() > 0.5 ? "1" : "0", speed: edge ? 2.4 + Math.random() * 2 : 1.1 + Math.random() * 1.6 });
  }
  if (columns.length > needed) columns.length = needed;
  for (let i = 0; i < columns.length; i += 1) {
    const column = columns[i];
    const near = pointer.inside && Math.abs(i - pointerCol) < (edge ? 3 : 8) && Math.abs(column.y - localY) < 170;
    if (near && Math.random() > 0.84) column.glyph = column.glyph === "0" ? "1" : "0";
    const push = near ? (i - pointerCol) * 1.6 : 0;
    ctx.globalAlpha = near ? 0.95 : edge ? 0.62 : 0.34;
    ctx.fillStyle = near ? "#00f3ff" : "#00ff9d";
    ctx.fillText(column.glyph, i * font + push, column.y);
    if (!reduce) column.y += column.speed;
    if (column.y > height + 16) {
      column.y = -Math.random() * 80;
      column.glyph = Math.random() > 0.5 ? "1" : "0";
    }
  }
  ctx.globalAlpha = 1;
}

export function BinaryField() {
  const backRef = useRef<HTMLCanvasElement>(null);
  const leftRef = useRef<HTMLCanvasElement>(null);
  const rightRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const columns: [Column[], Column[], Column[]] = [[], [], []];
    const onMove = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.inside = true;
    };
    const onLeave = () => {
      pointer.inside = false;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    let frame = 0;
    const loop = () => {
      frame = requestAnimationFrame(loop);
      if (document.hidden) return;
      if (backRef.current) paint(backRef.current, columns[0], false, reduce);
      if (leftRef.current) paint(leftRef.current, columns[1], true, reduce);
      if (rightRef.current) paint(rightRef.current, columns[2], true, reduce);
    };
    frame = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <>
      <canvas ref={backRef} className="binary-back" aria-hidden />
      <canvas ref={leftRef} className="binary-edge left" aria-hidden />
      <canvas ref={rightRef} className="binary-edge right" aria-hidden />
    </>
  );
}
