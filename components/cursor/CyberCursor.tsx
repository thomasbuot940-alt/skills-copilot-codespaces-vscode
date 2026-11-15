"use client";

import { useEffect, useRef } from "react";
import { pointer } from "@/lib/pointer";

export function CyberCursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const node = ref.current;
    if (!fine || !node) return;
    let frame = 0;
    let x = pointer.x;
    let y = pointer.y;
    const loop = () => {
      x += (pointer.x - x) * 0.38;
      y += (pointer.y - y) * 0.38;
      node.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      node.style.opacity = pointer.inside ? "1" : "0";
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    const onOver = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      node.dataset.hot = target?.closest("a, button, input, textarea, select, [data-cursor]") ? "1" : "0";
      node.dataset.text = target?.closest("input, textarea") ? "1" : "0";
    };
    window.addEventListener("mouseover", onOver);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("mouseover", onOver);
    };
  }, []);

  return (
    <div ref={ref} className="cyber-cursor" aria-hidden>
      <span />
    </div>
  );
}
