import { useTransitionNav } from '../context/TransitionContext'

export function About() {
  const { navigateWithRain } = useTransitionNav()

  return (
    <div className="page about-page">
      <header className="page-hero">
        <p className="eyebrow">ポートフォリオ</p>
        <h1>À propos / Contact</h1>
        <p>
          Puissance Game est une vitrine craft — pour montrer qu’un site peut être à la fois
          produit et preuve de niveau.
        </p>
      </header>

      <section className="about-grid">
        <article className="about-block">
          <h2>Thomas</h2>
          <p>
            Ingénieur logiciel. Ce magasin cyberpunk démontre UI soignée, animations
            intentionnelles, audio génératif, et UX complète — le genre de livrable qui fait
            gagner la confiance des PME et startups au Japon.
          </p>
        </article>
        <article className="about-block">
          <h2>Ce que prouve ce site</h2>
          <ul className="feature-list">
            <li>Multi-pages + panier fonctionnel</li>
            <li>Transitions pluie binaire 0/1</li>
            <li>Musique d’ambiance 100 % Web Audio (libre)</li>
            <li>Conseiller produit PULSE</li>
            <li>Responsive desktop & mobile</li>
          </ul>
        </article>
        <article className="about-block about-cta-block">
          <h2>Recruter / collaborer</h2>
          <p>
            Vous cherchez quelqu’un qui livre du polish, pas seulement des maquettes ?
            Parlons-en.
          </p>
          <a className="btn btn-primary" href="mailto:thomas@puissance.game?subject=Puissance%20Game">
            Contacter Thomas
          </a>
          <button type="button" className="btn btn-ghost" onClick={() => navigateWithRain('/catalogue')}>
            Explorer le catalogue
          </button>
        </article>
      </section>
    </div>
  )
}
