"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { AngelPanel } from "@/components/angel/AngelPanel";
import { BinaryField } from "@/components/background/BinaryField";
import { CyberCursor } from "@/components/cursor/CyberCursor";
import { HudBar } from "@/components/hud/HudBar";
import { CheckoutView } from "@/components/views/CheckoutView";
import { HomeView } from "@/components/views/HomeView";
import { LabView } from "@/components/views/LabView";
import { MethodView } from "@/components/views/MethodView";
import { OffersView } from "@/components/views/OffersView";
import { SiteProvider, useSite, type ViewId } from "@/components/site/SiteContext";
import { getAudioEngine } from "@/lib/audio/AudioEngine";
import { unlockSpeech } from "@/lib/angel/speech";

const TITLES: Record<ViewId, string> = {
  home: "POWERTECH THE FUTURE",
  method: "Méthode — POWERTECH THE FUTURE",
  lab: "Lab — POWERTECH THE FUTURE",
  offers: "Offres — POWERTECH THE FUTURE",
  checkout: "Paiement — POWERTECH THE FUTURE",
};

function Wipe({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="laser-wipe" aria-hidden>
      <span />
    </div>
  );
}

function Stage() {
  const { view, setView, setAngelOpen, angelOpen } = useSite();
  const [wipe, setWipe] = useState(false);
  const seen = useRef(view);

  useEffect(() => {
    document.title = TITLES[view];
    if (seen.current === view) return;
    seen.current = view;
    setWipe(true);
    getAudioEngine().play("tab");
    const timer = window.setTimeout(() => setWipe(false), 520);
    return () => window.clearTimeout(timer);
  }, [view]);

  useEffect(() => {
    const arm = () => {
      void getAudioEngine().unlock();
      unlockSpeech();
    };
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea")) return;
      const map: Record<string, ViewId> = { "1": "home", "2": "method", "3": "lab", "4": "offers", "5": "checkout" };
      if (map[event.key]) setView(map[event.key]);
      if (event.key === "Escape" && !document.querySelector("[data-dialog-open]")) setAngelOpen(false);
    };
    window.addEventListener("pointerdown", arm);
    window.addEventListener("keydown", arm);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", arm);
      window.removeEventListener("keydown", arm);
      window.removeEventListener("keydown", onKey);
    };
  }, [setAngelOpen, setView]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, ease: "easeOut" }} className={`relative min-h-screen ${angelOpen ? "xl:pr-[440px]" : ""}`}>
      <BinaryField />
      <div className="scanlines" />
      <CyberCursor />
      <HudBar />
      <Wipe active={wipe} />
      <main className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-28 pt-[calc(var(--hud-h,11rem)+1.25rem)] sm:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          >
            {view === "home" && <HomeView />}
            {view === "method" && <MethodView />}
            {view === "lab" && <LabView />}
            {view === "offers" && <OffersView />}
            {view === "checkout" && <CheckoutView />}
          </motion.div>
        </AnimatePresence>
        <footer className="mt-16 border-t border-white/10 pt-4 font-mono text-[10px] tracking-[0.18em] text-mute">
          POWERTECH THE FUTURE — THOMAS — 100 % EN LIGNE — CARTE PRÉPARÉE POUR STRIPE, JAMAIS STOCKÉE ICI
        </footer>
      </main>
      <AngelPanel />
    </motion.div>
  );
}

export function SiteShell() {
  return (
    <SiteProvider>
      <Stage />
    </SiteProvider>
  );
}
