"use client";

import { DecryptText } from "@/components/fx/DecryptText";
import { useSite } from "@/components/site/SiteContext";
import { TerminalPanel } from "@/components/terminal/TerminalPanel";
import { getAudioEngine } from "@/lib/audio/AudioEngine";

export function HomeView() {
  const { setView, openAngel } = useSite();
  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1.05fr_0.95fr]">
      <div>
        <p className="font-mono text-[11px] tracking-[0.32em] text-matrix">SYS.ONLINE // THOMAS</p>
        <h1 className="mt-3 font-mono text-4xl leading-none text-white sm:text-5xl">
          <DecryptText text="POWERTECH THE FUTURE" />
        </h1>
        <p className="mt-3 font-mono text-sm tracking-[0.14em] text-cyan">PYTHON ENGINEERING // AI, 3D & WEB SYSTEMS</p>
        <p className="mt-6 max-w-xl font-body text-base leading-relaxed text-ink">
          J&apos;écris des systèmes Python, des sites et des assistants IA. Le studio tient dans cette page : vous lisez la méthode, vous voyez le lab, vous choisissez une offre, vous payez par carte. Angel accueille, qualifie, et transmet. Aucun appel n&apos;est nécessaire.
        </p>
        <dl className="mt-6 grid grid-cols-3 gap-3 font-mono text-[11px]">
          <div className="border border-white/10 p-3">
            <dt className="text-mute">TJM</dt>
            <dd className="mt-1 text-lg text-matrix">350 €</dd>
          </div>
          <div className="border border-white/10 p-3">
            <dt className="text-mute">CANAL</dt>
            <dd className="mt-1 text-lg text-cyan">100 % écrit</dd>
          </div>
          <div className="border border-white/10 p-3">
            <dt className="text-mute">STACK</dt>
            <dd className="mt-1 text-lg text-white">Py · IA · Web</dd>
          </div>
        </dl>
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" className="bg-matrix px-4 py-2 font-mono text-sm text-void" onClick={() => { getAudioEngine().play("click"); setView("offers"); }}>
            Voir les offres
          </button>
          <button type="button" className="border border-cyan/70 px-4 py-2 font-mono text-sm text-cyan" onClick={() => { getAudioEngine().play("click"); setView("lab"); }}>
            Entrer dans le lab
          </button>
          <button type="button" className="border border-magenta/70 px-4 py-2 font-mono text-sm text-magenta" onClick={() => openAngel()}>
            Parler à Angel
          </button>
        </div>
      </div>
      <TerminalPanel />
    </div>
  );
}
