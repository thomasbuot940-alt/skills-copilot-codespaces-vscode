"use client";

import { useMemo, useState } from "react";
import { HoloBankCard } from "@/components/checkout/HoloBankCard";
import { useSite } from "@/components/site/SiteContext";
import { cvcOk, detectBrand, expiryOk, formatCardNumber, formatExpiry, luhnOk } from "@/lib/checkout/card";
import { computeCheckout, euro, OFFERS, type OfferId } from "@/lib/checkout/pricing";
import { getAudioEngine } from "@/lib/audio/AudioEngine";

type Field = "number" | "name" | "expiry" | "cvc" | null;

type Receipt = {
  mode: "preview" | "stripe";
  reference: string;
  today: number;
  monthly: number;
  base: number;
  label: string;
  message?: string;
};

export function CheckoutView() {
  const { draft, setDraft } = useSite();
  const [holder, setHolder] = useState("");
  const [email, setEmail] = useState("");
  const [number, setNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [focus, setFocus] = useState<Field>(null);
  const [customText, setCustomText] = useState(draft.customAmount ? String(draft.customAmount) : "");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  const quote = useMemo(() => computeCheckout(draft), [draft]);
  const brand = detectBrand(number);

  const setCustom = (value: string) => {
    setCustomText(value);
    const trimmed = value.trim().replace(",", ".");
    if (!trimmed) {
      setDraft({ customAmount: null });
      return;
    }
    const amount = Number(trimmed);
    setDraft({ customAmount: Number.isFinite(amount) ? amount : null });
  };

  const pay = async () => {
    setError("");
    getAudioEngine().play("click");
    if (!holder.trim()) return setError("Indiquez le nom sur la carte.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Indiquez un email de confirmation.");
    if (!luhnOk(number)) return setError("Le numéro de carte ne passe pas le contrôle de format.");
    if (!expiryOk(expiry)) return setError("La date d'expiration est invalide.");
    if (!cvcOk(cvc, brand)) return setError("Le CVC ne correspond pas au réseau de la carte.");
    if (quote.error) return setError(quote.error);
    setPending(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offerId: draft.offerId,
          maintenance: draft.maintenance,
          payMode: draft.payMode,
          customAmount: draft.customAmount,
          email,
          holder,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Le dossier n'a pas pu être préparé.");
        return;
      }
      setReceipt(data);
      setNumber("");
      setCvc("");
    } catch {
      setError("Réseau indisponible. Réessayez.");
    } finally {
      setPending(false);
    }
  };

  return (
    <section>
      <p className="font-mono text-[11px] tracking-[0.28em] text-cyan">CHECKOUT // CARTE</p>
      <h1 className="mt-2 font-mono text-3xl text-white">Paiement par carte bancaire</h1>
      <p className="mt-3 max-w-3xl font-body text-sm leading-relaxed text-ink">
        Le numéro, la date et le CVC restent dans cette page pour l&apos;affichage holographique. Ils ne sont pas envoyés à Powertech. L&apos;encaissement réel se branche sur Stripe Elements dès que les clés sont en place. Pour tester le format : 4242 4242 4242 4242, une date future, CVC 123.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {OFFERS.map((offer) => (
          <button
            key={offer.id}
            type="button"
            onClick={() => setDraft({ offerId: offer.id, payMode: "full" })}
            className={`border px-3 py-1 font-mono text-[11px] ${draft.offerId === offer.id ? "border-cyan text-cyan" : "border-white/15 text-mute"}`}
          >
            {offer.id.toUpperCase()} · {euro(offer.price)}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setDraft({ offerId: "custom" as OfferId })}
          className={`border px-3 py-1 font-mono text-[11px] ${draft.offerId === "custom" ? "border-magenta text-magenta" : "border-white/15 text-mute"}`}
        >
          Devis
        </button>
      </div>
      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_0.9fr]">
        <form
          className="space-y-4 border border-white/10 bg-black/40 p-4"
          onSubmit={(event) => {
            event.preventDefault();
            void pay();
          }}
          autoComplete="off"
        >
          <label className="block font-mono text-[11px] text-mute">
            Montant personnalisé / Devis sur-mesure
            <input value={customText} onChange={(event) => setCustom(event.target.value)} inputMode="decimal" className="mt-1 w-full border border-white/15 bg-transparent px-3 py-2 text-sm text-white outline-none" placeholder="Laisser vide pour le prix de l'offre" />
          </label>
          {draft.offerId === "pro" && draft.customAmount == null && (
            <div className="flex gap-2 font-mono text-[11px]">
              <button type="button" className={`border px-2 py-1 ${draft.payMode === "full" ? "border-cyan text-cyan" : "border-white/15 text-mute"}`} onClick={() => setDraft({ payMode: "full" })}>Comptant 397 €</button>
              <button type="button" className={`border px-2 py-1 ${draft.payMode === "split" ? "border-cyan text-cyan" : "border-white/15 text-mute"}`} onClick={() => setDraft({ payMode: "split" })}>1er versement 209 €</button>
            </div>
          )}
          <label className="flex items-center gap-2 font-mono text-xs text-white">
            <input type="checkbox" checked={draft.maintenance} onChange={(event) => setDraft({ maintenance: event.target.checked })} className="accent-matrix" />
            Pack Hébergement, Maintenance & Évolution IA (+ 49 € / mois)
          </label>
          <Field label="Nom sur la carte" value={holder} onChange={setHolder} onFocus={() => setFocus("name")} autoComplete="cc-name" />
          <Field label="Numéro" value={number} onChange={(value) => setNumber(formatCardNumber(value))} onFocus={() => setFocus("number")} inputMode="numeric" autoComplete="off" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Expiration" value={expiry} onChange={(value) => setExpiry(formatExpiry(value))} onFocus={() => setFocus("expiry")} inputMode="numeric" autoComplete="off" />
            <Field label="CVC" value={cvc} onChange={(value) => setCvc(value.replace(/\D/g, "").slice(0, brand === "amex" ? 4 : 4))} onFocus={() => setFocus("cvc")} onBlur={() => setFocus(null)} inputMode="numeric" autoComplete="off" />
          </div>
          <Field label="Email de confirmation" value={email} onChange={setEmail} onFocus={() => setFocus(null)} type="email" autoComplete="email" />
          {quote.error ? <p className="font-mono text-xs text-magenta">{quote.error}</p> : (
            <div className="space-y-1 font-mono text-sm text-white">
              <p className="text-mute">{quote.label}</p>
              <p>Prestation : {euro(quote.base)}</p>
              {quote.monthly > 0 && <p>Hébergement, premier mois : {euro(quote.monthly)}</p>}
              <p className="text-lg text-matrix">Total aujourd&apos;hui : {euro(quote.today)}</p>
              {quote.monthly > 0 && <p className="text-cyan">Puis {euro(quote.monthly)} / mois</p>}
              {draft.offerId === "pro" && draft.payMode === "split" && draft.customAmount == null && (
                <p className="text-mute">Second versement de 209 € à convenir par écrit.</p>
              )}
            </div>
          )}
          {error && <p className="font-mono text-xs text-magenta">{error}</p>}
          <button type="submit" disabled={pending || Boolean(quote.error)} className="w-full bg-matrix px-4 py-3 font-mono text-sm text-void disabled:opacity-50">
            {pending ? "Préparation..." : `Préparer le paiement (${quote.error ? "—" : euro(quote.today)})`}
          </button>
          <p className="flex items-center gap-2 font-mono text-[10px] tracking-[0.14em] text-mute">
            <Lock /> SSL 256-bit · Visa · Mastercard · Amex
          </p>
          {receipt && (
            <div className="border border-matrix/50 p-3 font-mono text-xs text-matrix">
              <p>Référence {receipt.reference}</p>
              <p className="mt-1 text-white">{receipt.label} — {euro(receipt.today)}</p>
              <p className="mt-2 text-ink">{receipt.mode === "stripe" ? "PaymentIntent Stripe créé. Branchez Stripe Elements avec la clé publique pour encaisser." : receipt.message}</p>
            </div>
          )}
        </form>
        <div className="lg:sticky lg:top-36">
          <HoloBankCard number={number} name={holder} expiry={expiry} cvc={cvc} brand={brand} flipped={focus === "cvc"} />
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  onFocus,
  onBlur,
  type = "text",
  inputMode,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  type?: string;
  inputMode?: "numeric" | "decimal" | "text" | "email";
  autoComplete?: string;
}) {
  return (
    <label className="block font-mono text-[11px] text-mute">
      {label}
      <input
        value={value}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        className="mt-1 w-full border border-white/15 bg-transparent px-3 py-2 text-sm text-white outline-none"
      />
    </label>
  );
}

function Lock() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
      <rect x="2" y="5" width="8" height="6" fill="none" stroke="#00ff9d" />
      <path d="M4 5V3.5a2 2 0 0 1 4 0V5" fill="none" stroke="#00ff9d" />
    </svg>
  );
}
