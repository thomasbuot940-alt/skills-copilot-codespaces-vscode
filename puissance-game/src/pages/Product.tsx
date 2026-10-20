import { useParams } from 'react-router-dom'
import { formatYen, getProduct } from '../data/products'
import { ProductArt } from '../components/ProductArt'
import { useCart } from '../context/CartContext'
import { useTransitionNav } from '../context/TransitionContext'

export function ProductPage() {
  const { slug = '' } = useParams()
  const product = getProduct(slug)
  const { add } = useCart()
  const { navigateWithRain } = useTransitionNav()

  if (!product) {
    return (
      <div className="page">
        <header className="page-hero">
          <h1>Signal perdu</h1>
          <p>Ce titre n’existe pas dans le registre.</p>
          <button type="button" className="btn btn-primary" onClick={() => navigateWithRain('/catalogue')}>
            Retour catalogue
          </button>
        </header>
      </div>
    )
  }

  return (
    <div className="page product-page">
      <div className="product-layout">
        <ProductArt product={product} large />
        <div className="product-detail">
          <p className="product-ja">{product.titleJa}</p>
          <h1>{product.title}</h1>
          <p className="product-tagline">{product.tagline}</p>
          <div className="product-stats">
            <span>{formatYen(product.price)}</span>
            <span>{product.genre}</span>
            <span>★ {product.rating}</span>
            <span>{product.year}</span>
          </div>
          <p className="product-desc">{product.description}</p>
          <ul className="feature-list">
            {product.features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <div className="product-actions">
            <button
              type="button"
              className="btn btn-primary"
              data-testid="add-to-cart"
              onClick={() => {
                add(product.slug)
                window.setTimeout(() => navigateWithRain('/panier'), 40)
              }}
            >
              Ajouter au panier
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => navigateWithRain('/catalogue')}
            >
              Autres titres
            </button>
          </div>
          <div className="tag-row">
            {product.tags.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
