"use client";

import type { CardBrand } from "@/lib/checkout/card";

export function HoloBankCard({
  number,
  name,
  expiry,
  cvc,
  brand,
  flipped,
}: {
  number: string;
  name: string;
  expiry: string;
  cvc: string;
  brand: CardBrand;
  flipped: boolean;
}) {
  const shown = number.trim() || "•••• •••• •••• ••••";
  return (
    <div className="card-scene">
      <div className={`card-inner ${flipped ? "is-flipped" : ""}`}>
        <div className="card-face">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-mono text-[10px] tracking-[0.22em] text-cyan">POWERTECH // HOLO CARD</p>
              <p className="mt-3 h-7 w-10 rounded-sm bg-gradient-to-br from-cyan/70 to-matrix/40" aria-hidden />
            </div>
            <BrandMark brand={brand} />
          </div>
          <p className="mt-6 font-mono text-xl tracking-[0.14em] text-white sm:text-2xl">{shown}</p>
          <div className="mt-4 flex items-end justify-between font-mono text-xs">
            <div>
              <p className="text-[9px] tracking-[0.16em] text-mute">TITULAIRE</p>
              <p className="text-sm text-white">{(name || "VOTRE NOM").toUpperCase()}</p>
            </div>
            <div>
              <p className="text-[9px] tracking-[0.16em] text-mute">EXPIRE</p>
              <p className="text-sm text-white">{expiry || "MM/AA"}</p>
            </div>
          </div>
        </div>
        <div className="card-face back">
          <div className="absolute inset-x-0 top-6 h-10 bg-black/80" />
          <div className="absolute inset-x-6 bottom-6">
            <p className="font-mono text-[10px] tracking-[0.16em] text-mute">CVC</p>
            <p className="mt-1 bg-white/90 px-3 py-2 text-right font-mono text-void">{cvc || "•••"}</p>
            <p className="mt-3 font-mono text-[10px] text-cyan">SSL 256-bit · Stripe Elements ready</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function BrandMark({ brand }: { brand: CardBrand }) {
  const active = (name: CardBrand) => (brand === name ? "border-cyan text-cyan" : "border-white/15 text-white/40");
  return (
    <div className="flex gap-1 font-mono text-[9px]" aria-label={`Réseau ${brand}`}>
      <span className={`border px-1 py-0.5 ${active("visa")}`}>VISA</span>
      <span className={`border px-1 py-0.5 ${active("mastercard")}`}>MC</span>
      <span className={`border px-1 py-0.5 ${active("amex")}`}>AMEX</span>
    </div>
  );
}
