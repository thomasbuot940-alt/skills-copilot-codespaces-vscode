"use client";

import { useEffect, useRef } from "react";
import { getAudioEngine } from "@/lib/audio/AudioEngine";

export function TiltCard({
  children,
  className = "",
  hot = false,
}: {
  children: React.ReactNode;
  className?: string;
  hot?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const fine = useRef(false);

  useEffect(() => {
    fine.current = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  }, []);

  return (
    <div className="[perspective:900px]">
      <div
        ref={ref}
        className={`tilt-card h-full p-5 ${hot ? "is-hot" : ""} ${className}`}
        onMouseEnter={() => getAudioEngine().play("hover")}
        onMouseMove={(event) => {
          const node = ref.current;
          if (!node || !fine.current) return;
          const rect = node.getBoundingClientRect();
          const x = event.clientX - rect.left;
          const y = event.clientY - rect.top;
          node.style.setProperty("--mx", `${x}px`);
          node.style.setProperty("--my", `${y}px`);
          const rx = (y / rect.height - 0.5) * -8;
          const ry = (x / rect.width - 0.5) * 10;
          node.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translate3d(0,0,0)`;
        }}
        onMouseLeave={() => {
          const node = ref.current;
          if (!node) return;
          node.style.transform = "rotateX(0deg) rotateY(0deg) translate3d(0,0,0)";
        }}
      >
        <div className="tilt-glow" />
        <div className="relative">{children}</div>
      </div>
    </div>
  );
}
