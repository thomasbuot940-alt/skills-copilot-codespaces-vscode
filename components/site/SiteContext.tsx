"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_DRAFT, type CheckoutDraft, type OfferId } from "@/lib/checkout/pricing";
import { getAudioEngine } from "@/lib/audio/AudioEngine";

export type ViewId = "home" | "method" | "lab" | "offers" | "checkout";
export type AngelMode = "public" | "studio";
export type AngelIntent = "client" | "recruit";

type SiteValue = {
  view: ViewId;
  setView: (view: ViewId) => void;
  draft: CheckoutDraft;
  setDraft: (patch: Partial<CheckoutDraft>) => void;
  openCheckout: (offerId: OfferId) => void;
  angelOpen: boolean;
  setAngelOpen: (open: boolean) => void;
  angelMode: AngelMode;
  setAngelMode: (mode: AngelMode) => void;
  angelIntent: AngelIntent;
  recruitTick: number;
  openAngel: (options?: { mode?: AngelMode; intent?: AngelIntent; recruit?: boolean }) => void;
};

const SiteContext = createContext<SiteValue | null>(null);

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const [view, setViewState] = useState<ViewId>("home");
  const [draft, setDraftState] = useState<CheckoutDraft>(DEFAULT_DRAFT);
  const [angelOpen, setAngelOpen] = useState(false);
  const [angelMode, setAngelMode] = useState<AngelMode>("public");
  const [angelIntent, setAngelIntent] = useState<AngelIntent>("client");
  const [recruitTick, setRecruitTick] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setAngelOpen(true), 1000);
    return () => window.clearTimeout(timer);
  }, []);

  const value = useMemo<SiteValue>(() => ({
    view,
    setView: (next) => setViewState(next),
    draft,
    setDraft: (patch) => setDraftState((current) => ({ ...current, ...patch })),
    openCheckout: (offerId) => {
      setDraftState((current) => ({ ...current, offerId, payMode: offerId === "pro" ? current.payMode : "full" }));
      setViewState("checkout");
    },
    angelOpen,
    setAngelOpen,
    angelMode,
    setAngelMode,
    angelIntent,
    recruitTick,
    openAngel: (options) => {
      if (options?.mode) setAngelMode(options.mode);
      if (options?.intent) setAngelIntent(options.intent);
      if (options?.recruit) {
        setAngelIntent("recruit");
        setRecruitTick((tick) => tick + 1);
      }
      setAngelOpen(true);
      getAudioEngine().play("angel");
    },
  }), [view, draft, angelOpen, angelMode, angelIntent, recruitTick]);

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite(): SiteValue {
  const value = useContext(SiteContext);
  if (!value) throw new Error("useSite doit être utilisé dans SiteProvider.");
  return value;
}
