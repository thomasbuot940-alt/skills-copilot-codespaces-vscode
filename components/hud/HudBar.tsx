"use client";

import { useEffect, useState } from "react";
import { AudioControl } from "@/components/hud/AudioControl";
import { useSite, type ViewId } from "@/components/site/SiteContext";
import { getAudioEngine } from "@/lib/audio/AudioEngine";

const LINKS: Array<{ id: ViewId; label: string; key: string }> = [
  { id: "home", label: "Terminal", key: "1" },
  { id: "method", label: "Méthode", key: "2" },
  { id: "lab", label: "Lab", key: "3" },
  { id: "offers", label: "Offres", key: "4" },
  { id: "checkout", label: "Paiement", key: "5" },
];

export function HudBar() {
  const { view, setView } = useSite();
  const [clock, setClock] = useState("");

  useEffect(() => {
    const header = document.querySelector("header.hud-glass");
    if (!header) return;
    const apply = () => {
      document.documentElement.style.setProperty("--hud-h", `${Math.ceil(header.getBoundingClientRect().height)}px`);
    };
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(header);
    window.addEventListener("resize", apply);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", apply);
    };
  }, []);

  useEffect(() => {
    const format = () => new Intl.DateTimeFormat("fr-FR", {
      timeZone: "Europe/Paris",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date());
    setClock(format());
    const timer = window.setInterval(() => setClock(format()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <header className="hud-glass fixed inset-x-0 top-0 z-40">
      <div className="flex flex-wrap items-center gap-3 px-3 py-2 sm:px-5">
        <div className="min-w-0 flex-1 md:flex-none">
          <p className="font-mono text-sm tracking-[0.18em] text-white sm:text-base">POWERTECH THE FUTURE</p>
          <p className="font-mono text-[9px] tracking-[0.16em] text-cyan sm:text-[10px]">PYTHON ENGINEERING // AI, 3D & WEB SYSTEMS</p>
        </div>
        <div className="order-2 md:order-3">
          <AudioControl />
        </div>
        <nav className="order-3 flex w-full gap-1 overflow-x-auto pb-1 md:order-2 md:w-auto md:flex-1" aria-label="Sections">
          {LINKS.map((link) => {
            const active = view === link.id;
            return (
              <button
                key={link.id}
                type="button"
                aria-current={active ? "page" : undefined}
                onClick={() => {
                  setView(link.id);
                  getAudioEngine().play("click");
                }}
                className={`shrink-0 border px-2.5 py-1 font-mono text-[11px] tracking-[0.14em] ${active ? "border-cyan text-cyan" : "border-white/10 text-mute hover:border-matrix/50 hover:text-matrix"}`}
              >
                <span className="mr-1 text-[9px] text-magenta">{link.key}</span>
                {link.label}
              </button>
            );
          })}
        </nav>
        <p className="order-4 hidden font-mono text-[10px] text-mute xl:block">PARIS {clock}</p>
      </div>
      <div className="flex justify-end px-3 pb-2 sm:px-5">
        <button
          type="button"
          onClick={() => setView("offers")}
          className="inline-flex max-w-full items-center gap-2 border border-matrix/50 bg-matrix/5 px-3 py-1 text-left font-mono text-[10px] leading-snug tracking-[0.08em] text-matrix sm:text-[11px]"
        >
          <span className="status-dot shrink-0" aria-hidden />
          STATUT : DISPONIBLE POUR MISSIONS & RECRUTEMENT TECH (TJM 350 €/j)
        </button>
      </div>
    </header>
  );
}
