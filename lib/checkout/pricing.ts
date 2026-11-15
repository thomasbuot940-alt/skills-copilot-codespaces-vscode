export type OfferId = "starter" | "pro" | "enterprise" | "custom";

export type PayMode = "full" | "split";

export type CheckoutDraft = {
  offerId: OfferId;
  maintenance: boolean;
  payMode: PayMode;
  customAmount: number | null;
};

export const MAINTENANCE_EUR = 49;
export const TJM_EUR = 350;

export const OFFERS = [
  {
    id: "starter" as const,
    code: "STARTER // AUTOMATISATION & LANDING",
    price: 149,
    cadence: "Paiement unique",
    cta: "Activer ce module (149 €)",
    blurb: "Script Python sur-mesure, bot d'automatisation, scraping ou page web moderne livrée rapidement.",
    points: ["Script Python sur mesure", "Bot, scraping ou automatisation", "Ou une landing moderne, livrée vite"],
  },
  {
    id: "pro" as const,
    code: "PRO // SYSTÈME COMPLET WEB + IA",
    price: 397,
    split: 209,
    cadence: "ou 2x 209 €",
    cta: "Lancer ce projet (397 €)",
    badge: "RECOMMANDÉ // LE PLUS CHOISI",
    blurb: "Site web complet ultra-fluide, intégration d'un assistant IA sur-mesure, base de données et paiement sécurisé.",
    points: ["Site web ultra-fluide", "Assistant IA sur mesure", "Base de données et paiement sécurisé"],
  },
  {
    id: "enterprise" as const,
    code: "ENTERPRISE // ARCHITECTURE SUR-MESURE",
    price: 797,
    cadence: "Paiement unique",
    cta: "Réserver l'architecture (797 €)",
    blurb: "Application web complète, base de données, automatisations Python avancées et déploiement complet.",
    points: ["Application web complète", "Automatisations Python avancées", "Déploiement complet"],
  },
];

export const DEFAULT_DRAFT: CheckoutDraft = {
  offerId: "pro",
  maintenance: false,
  payMode: "full",
  customAmount: null,
};

export function euro(value: number): string {
  return `${new Intl.NumberFormat("fr-FR").format(value)} €`;
}

export type CheckoutQuote = {
  today: number;
  monthly: number;
  base: number;
  label: string;
  error?: string;
};

export function computeCheckout(input: CheckoutDraft): CheckoutQuote {
  const custom = input.customAmount;
  let base: number;
  let label: string;

  if (custom != null && !Number.isNaN(custom) && custom > 0) {
    if (custom < 49 || custom > 50000) {
      return { today: 0, monthly: 0, base: 0, label: "", error: "Le montant personnalisé se situe entre 49 € et 50 000 €." };
    }
    base = Math.round(custom * 100) / 100;
    label = "Montant personnalisé / devis sur-mesure";
  } else if (input.offerId === "custom") {
    return { today: 0, monthly: 0, base: 0, label: "", error: "Indiquez un montant pour le devis sur-mesure." };
  } else if (input.offerId === "pro" && input.payMode === "split") {
    base = 209;
    label = "PRO // premier versement (2x 209 €)";
  } else {
    const offer = OFFERS.find((item) => item.id === input.offerId) ?? OFFERS[1];
    base = offer.price;
    label = offer.code;
  }

  const monthly = input.maintenance ? MAINTENANCE_EUR : 0;
  const today = Math.round((base + monthly) * 100) / 100;
  return { today, monthly, base, label };
}
