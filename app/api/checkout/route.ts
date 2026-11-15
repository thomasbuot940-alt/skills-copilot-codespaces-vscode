import { computeCheckout, type CheckoutDraft, type OfferId, type PayMode } from "@/lib/checkout/pricing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const OFFERS = new Set<OfferId>(["starter", "pro", "enterprise", "custom"]);

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return Response.json({ error: "Requête illisible." }, { status: 400 });
  const raw = body as Record<string, unknown>;
  if (["cardNumber", "cvc", "pan", "number", "cvv"].some((key) => key in raw)) {
    return Response.json(
      { error: "Les données de carte ne sont pas acceptées sur ce serveur. L'encaissement passe par Stripe Elements." },
      { status: 400 },
    );
  }

  const offerId = raw.offerId;
  if (typeof offerId !== "string" || !OFFERS.has(offerId as OfferId)) {
    return Response.json({ error: "Offre inconnue." }, { status: 400 });
  }
  const email = typeof raw.email === "string" ? raw.email.trim() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Email invalide." }, { status: 400 });
  }
  const payMode: PayMode = raw.payMode === "split" ? "split" : "full";
  const customAmount = typeof raw.customAmount === "number" && Number.isFinite(raw.customAmount) ? raw.customAmount : null;
  const draft: CheckoutDraft = {
    offerId: offerId as OfferId,
    maintenance: raw.maintenance === true,
    payMode,
    customAmount,
  };
  const quote = computeCheckout(draft);
  if (quote.error) return Response.json({ error: quote.error }, { status: 400 });

  const reference = `PT-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  const holder = typeof raw.holder === "string" ? raw.holder.slice(0, 80) : "";

  if (process.env.STRIPE_SECRET_KEY) {
    try {
      const { default: Stripe } = await import("stripe");
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const intent = await stripe.paymentIntents.create({
        amount: Math.round(quote.today * 100),
        currency: "eur",
        automatic_payment_methods: { enabled: true },
        receipt_email: email,
        metadata: {
          reference,
          offerId,
          maintenance: String(draft.maintenance),
          label: quote.label.slice(0, 120),
        },
      });
      return Response.json({
        mode: "stripe",
        reference,
        clientSecret: intent.client_secret,
        today: quote.today,
        monthly: quote.monthly,
        base: quote.base,
        label: quote.label,
        holder,
      });
    } catch (error) {
      console.error("Stripe intent failed", error instanceof Error ? error.name : "error");
      return Response.json({ error: "Stripe n'a pas pu préparer l'encaissement." }, { status: 502 });
    }
  }

  return Response.json({
    mode: "preview",
    reference,
    today: quote.today,
    monthly: quote.monthly,
    base: quote.base,
    label: quote.label,
    message:
      "Dossier de paiement préparé. L'encaissement Stripe s'active dès que les clés sont configurées. Aucun numéro de carte n'a été transmis.",
  });
}
