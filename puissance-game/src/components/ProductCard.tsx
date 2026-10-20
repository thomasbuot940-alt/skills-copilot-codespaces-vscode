import type { Product } from '../data/products'
import { formatYen } from '../data/products'
import { useTransitionNav } from '../context/TransitionContext'
import { ProductArt } from './ProductArt'

type Props = { product: Product; featured?: boolean }

export function ProductCard({ product, featured }: Props) {
  const { navigateWithRain } = useTransitionNav()

  return (
    <article className={`product-tile ${featured ? 'is-featured' : ''}`}>
      <button
        type="button"
        className="product-tile-hit"
        onClick={() => navigateWithRain(`/produit/${product.slug}`)}
      >
        <ProductArt product={product} />
        <div className="product-tile-meta">
          <p className="product-ja">{product.titleJa}</p>
          <h3>{product.title}</h3>
          <p className="product-tagline">{product.tagline}</p>
          <div className="product-tile-foot">
            <span className="price">{formatYen(product.price)}</span>
            <span className="genre">{product.genre}</span>
          </div>
        </div>
      </button>
    </article>
  )
}
