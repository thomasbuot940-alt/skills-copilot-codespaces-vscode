"use client";

import { DecryptText } from "@/components/fx/DecryptText";
import { TiltCard } from "@/components/fx/TiltCard";
import { useSite } from "@/components/site/SiteContext";
import { OFFERS, euro } from "@/lib/checkout/pricing";
import { getAudioEngine } from "@/lib/audio/AudioEngine";

export function OffersView() {
  const { draft, setDraft, openCheckout, openAngel } = useSite();
  return (
    <section>
      <p className="font-mono text-[11px] tracking-[0.28em] text-matrix">OFFRES // CONVERSION</p>
      <h1 className="mt-2 font-mono text-3xl text-white sm:text-4xl">
        <DecryptText text="Trois modules, un prix clair" />
      </h1>
      <p className="mt-3 max-w-3xl font-body text-sm leading-relaxed text-ink">
        Les montants sont fixes pour que vous puissiez décider sans appel. Le Pack Pro est au centre parce que c&apos;est le système complet — site, assistant, données, paiement — que la plupart des projets demandent. Vous pouvez ajuster le montant au paiement.
      </p>
      <div className="mt-8 grid items-stretch gap-4 md:grid-cols-3">
        {OFFERS.map((offer) => {
          const hot = offer.id === "pro";
          return (
            <div key={offer.id} className={hot ? "md:-translate-y-3 md:scale-[1.03]" : ""}>
              <TiltCard hot={hot} className="flex h-full flex-col">
                {hot && "badge" in offer && offer.badge && (
                  <p className="badge-pop font-mono text-[10px] tracking-[0.16em] text-cyan">{offer.badge}</p>
                )}
                <h2 className="mt-2 font-mono text-sm leading-snug text-white">{offer.code}</h2>
                <p className="mt-4 font-mono text-4xl text-matrix">{euro(offer.price)}</p>
                <p className="font-mono text-xs text-mute">{offer.cadence}</p>
                <p className="mt-3 font-body text-sm leading-relaxed text-ink">{offer.blurb}</p>
                <ul className="mt-3 space-y-1 font-mono text-[11px] text-cyan">
                  {offer.points.map((point) => (
                    <li key={point}>▸ {point}</li>
                  ))}
                </ul>
                <button
                  type="button"
                  className={`mt-5 w-full px-3 py-2 font-mono text-sm ${hot ? "bg-cyan text-void" : "border border-matrix text-matrix"}`}
                  onClick={() => {
                    getAudioEngine().play("click");
                    openCheckout(offer.id);
                  }}
                >
                  {offer.cta}
                </button>
              </TiltCard>
            </div>
          );
        })}
      </div>
      <label className="mt-6 flex items-start gap-3 border border-white/15 bg-black/40 p-4 font-mono text-sm text-white">
        <input
          type="checkbox"
          checked={draft.maintenance}
          onChange={(event) => setDraft({ maintenance: event.target.checked })}
          className="mt-1 accent-matrix"
        />
        <span>[+] Ajouter le Pack Hébergement, Maintenance & Évolution IA (+ 49 € / mois)</span>
      </label>
      <aside className="mt-4 border border-magenta/50 bg-magenta/5 p-5">
        <p className="font-mono text-[11px] tracking-[0.2em] text-magenta">STARTUPS & ÉQUIPES TECH</p>
        <h2 className="mt-2 font-mono text-2xl text-white">RECRUTEMENT TECH & MISSIONS — TJM 350 € / jour</h2>
        <p className="mt-2 max-w-2xl font-body text-sm leading-relaxed text-ink">
          Mission freelance ou contrat plus long, en France et à l&apos;international, à distance. Python, IA, architecture web, interfaces immersives.
        </p>
        <button type="button" className="mt-4 border border-magenta px-4 py-2 font-mono text-sm text-magenta" onClick={() => openAngel({ recruit: true })}>
          Proposer une opportunité à Thomas
        </button>
      </aside>
    </section>
  );
}
