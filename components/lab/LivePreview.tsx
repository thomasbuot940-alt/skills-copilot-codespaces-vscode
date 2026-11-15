"use client";

import { useEffect, useRef, useState } from "react";
import { projectBySlug } from "@/data/projects";

export function LivePreview({ slug, framed = false }: { slug: string; framed?: boolean }) {
  const project = projectBySlug(slug);
  if (!project) return <p className="font-mono text-sm text-magenta">Aperçu introuvable.</p>;
  return (
    <div className={`min-h-[240px] bg-[#07080d] p-4 ${framed ? "border border-cyan/40" : ""}`}>
      <p className="font-mono text-[10px] tracking-[0.2em] text-mute">LIVE // {project.title}</p>
      <div className="mt-3">
        {slug === "puissance-game" && <StorePreview />}
        {slug === "powertech-os" && <HudPreview />}
        {slug === "angel-core" && <AngelPreview />}
        {slug === "pipeline-python" && <PipelinePreview />}
        {slug === "audio-engine" && <AudioPreview />}
        {slug === "binary-field" && <BinaryPreview />}
      </div>
    </div>
  );
}

function StorePreview() {
  const [active, setActive] = useState("Neon Protocol");
  const games = ["Neon Protocol", "Signal Noir", "Arcade Lumen"];
  return (
    <div>
      <div className="flex gap-2">
        {games.map((game) => (
          <button key={game} type="button" onClick={() => setActive(game)} className={`border px-2 py-1 font-mono text-[11px] ${active === game ? "border-cyan text-cyan" : "border-white/15 text-mute"}`}>
            {game}
          </button>
        ))}
      </div>
      <p className="mt-4 font-mono text-sm text-matrix">Fiche active : {active}</p>
      <p className="mt-1 text-sm text-ink">Panier démo, couverture néon, ajout en un clic. La démo publique s&apos;ouvre via le lien du projet.</p>
    </div>
  );
}

function HudPreview() {
  return (
    <div className="border border-matrix/40 p-3">
      <p className="font-mono text-xs text-white">POWERTECH THE FUTURE</p>
      <p className="font-mono text-[10px] text-cyan">HUD · TERMINAL · LAB · OFFRES · PAIEMENT</p>
      <p className="mt-3 text-sm text-ink">La page que vous consultez est le système. Angel, le champ binaire et le checkout en font partie.</p>
    </div>
  );
}

function AngelPreview() {
  return (
    <div className="max-w-sm border border-cyan/40 p-3">
      <p className="font-mono text-[10px] text-cyan">ANGEL // PUBLIC</p>
      <p className="mt-2 text-sm text-ink">Bonjour. Dites-moi votre prénom et le projet. Je prépare le dossier pour Thomas, sans appel.</p>
    </div>
  );
}

function PipelinePreview() {
  const [ran, setRan] = useState(false);
  return (
    <div className="font-mono text-sm">
      <p className="text-mute">tjm = 350</p>
      <p className="text-mute">jours = 5</p>
      <p className="text-white">print(tjm * jours)</p>
      <button type="button" className="mt-3 border border-matrix px-2 py-1 text-matrix" onClick={() => setRan(true)}>
        Exécuter l&apos;extrait
      </button>
      {ran && <p className="mt-2 text-matrix">1750</p>}
    </div>
  );
}

function AudioPreview() {
  return (
    <div className="flex h-16 items-end gap-1" aria-hidden>
      {Array.from({ length: 18 }, (_, index) => (
        <span key={index} className="eq-bar" style={{ height: "100%", animation: `wave ${0.7 + (index % 5) * 0.12}s ease-in-out ${index * 0.05}s infinite` }} />
      ))}
    </div>
  );
}

function BinaryPreview() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const drops = Array.from({ length: 28 }, () => Math.random() * 80);
    let frame = 0;
    const loop = () => {
      ctx.fillStyle = "rgba(5,5,8,0.25)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = "12px monospace";
      ctx.fillStyle = "#00ff9d";
      drops.forEach((y, index) => {
        ctx.fillText(Math.random() > 0.5 ? "1" : "0", index * 12, y);
        drops[index] = y > 90 ? 0 : y + 2;
      });
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, []);
  return <canvas ref={ref} width={336} height={90} className="h-[90px] w-full" />;
}
