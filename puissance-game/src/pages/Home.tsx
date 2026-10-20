import { products } from '../data/products'
import { ProductCard } from '../components/ProductCard'
import { useTransitionNav } from '../context/TransitionContext'

export function Home() {
  const { navigateWithRain } = useTransitionNav()

  return (
    <div className="page home-page">
      <section className="hero">
        <div className="hero-backdrop" aria-hidden>
          <div className="hero-scan" />
          <div className="hero-grid" />
          <div className="hero-orb hero-orb--a" />
          <div className="hero-orb hero-orb--b" />
        </div>
        <div className="hero-copy">
          <p className="hero-ja">ピュイサンス・ゲーム</p>
          <h1 className="hero-brand">
            Puissance
            <span>Game</span>
          </h1>
          <p className="hero-lead">
            Magasin cyberpunk de jeux vidéo — conçu comme une vitrine pour PME et
            startups au Japon.
          </p>
          <div className="hero-cta">
            <button type="button" className="btn btn-primary" onClick={() => navigateWithRain('/catalogue')}>
              Entrer dans le catalogue
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => navigateWithRain('/a-propos')}>
              Qui est Thomas ?
            </button>
          </div>
        </div>
      </section>

      <section className="section featured-section">
        <header className="section-head">
          <h2>Signal du moment</h2>
          <p>Trois titres qui définissent l’ambiance Puissance.</p>
        </header>
        <div className="product-row">
          {products.slice(0, 3).map((p) => (
            <ProductCard key={p.id} product={p} featured />
          ))}
        </div>
      </section>

      <section className="section strip-section">
        <p className="strip-line">
          <span>0</span> transitions binaires <span>1</span> ambiance générative{' '}
          <span>0</span> conseiller PULSE <span>1</span>
        </p>
      </section>
    </div>
  )
}
