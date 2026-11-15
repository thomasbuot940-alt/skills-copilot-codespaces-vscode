"use client";

import { DecryptText } from "@/components/fx/DecryptText";
import { TiltCard } from "@/components/fx/TiltCard";

const CARDS = [
  {
    title: "Transparence Totale",
    body: "Aucun secret de fabrication. J'utilise les technologies d'IA générative les plus avancées associées au code Python pour bâtir des solutions modernes.",
  },
  {
    title: "Haute Qualité & Contrôle Humain",
    body: "L'IA accélère la production, mais c'est mon travail d'ingénierie, ma structure Python, mes vérifications et ma finition qui garantissent un résultat fiable, sécurisé et irréprochable.",
  },
  {
    title: "Rapidité & Efficacité 100 % En Ligne",
    body: "Tout se gère simplement par écrit ou via Angel, sans perte de temps, avec des délais de livraison 3x à 5x plus rapides qu'une agence classique.",
  },
];

export function MethodView() {
  return (
    <article>
      <p className="font-mono text-[11px] tracking-[0.28em] text-magenta">MÉTHODE // TRANSPARENCE</p>
      <h1 className="mt-2 font-mono text-3xl text-white sm:text-4xl">
        <DecryptText text="Comment je travaille" />
      </h1>
      <div className="mt-6 max-w-3xl space-y-4 font-body text-base leading-relaxed text-ink">
        <p>
          Je m&apos;appelle Thomas. Powertech The Future est mon studio : Python, IA et systèmes web. Tout se fait par écrit, sur ce site ou avec Angel. Aucun appel n&apos;est nécessaire.
        </p>
        <p>
          Ce site, comme les outils que je livre, est construit en pilotant des IA génératives avancées. Je le dis clairement : une partie de la production est accélérée par ces modèles. Ce qui ne se délègue pas, c&apos;est l&apos;architecture, la structure du code Python, les vérifications et la finition. C&apos;est ce travail d&apos;ingénierie que vous achetez.
        </p>
        <p>Le déroulé d&apos;une mission tient en cinq temps, tous écrits :</p>
        <ol className="list-decimal space-y-2 pl-5">
          <li>Vous décrivez le besoin à Angel, ou vous choisissez une offre. On pose le périmètre, les fonctions utiles et le délai.</li>
          <li>Je verrouille une architecture simple : ce qui est dans la première version, et ce qui attend.</li>
          <li>J&apos;implémente en Python et avec les technos web adaptées. L&apos;IA sert d&apos;accélérateur, sous revue.</li>
          <li>Je vérifie les cas limites, la sécurité de base — pas de secret exposé, paiement délégué à Stripe — et le rendu.</li>
          <li>Vous recevez le livrable et les accès. Si vous le souhaitez, le pack hébergement, maintenance et évolution IA est à 49 € par mois.</li>
        </ol>
        <p>
          La chaîne est courte : vous, moi, et des outils que je pilote. Je vise des délais 3 à 5 fois plus courts qu&apos;une agence classique. La vitesse ne remplace pas la relecture.
        </p>
        <p>
          Vous pouvez me confier un script, une automatisation, une landing, un site complet avec assistant, ou une petite application avec base de données et paiement. Pour une équipe : mission au TJM de 350 € par jour, en France ou à l&apos;international, à distance.
        </p>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {CARDS.map((card) => (
          <TiltCard key={card.title}>
            <h2 className="font-mono text-lg text-cyan">
              <DecryptText text={card.title} />
            </h2>
            <p className="mt-3 font-body text-sm leading-relaxed text-ink">{card.body}</p>
          </TiltCard>
        ))}
      </div>
    </article>
  );
}
