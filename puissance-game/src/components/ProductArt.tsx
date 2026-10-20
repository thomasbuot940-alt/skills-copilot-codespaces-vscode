import type { Product } from '../data/products'

export function ProductArt({ product, large }: { product: Product; large?: boolean }) {
  return (
    <div
      className={`product-art pattern-${product.pattern} ${large ? 'is-large' : ''}`}
      style={{ ['--art-accent' as string]: product.accent }}
      aria-hidden
    >
      <div className="product-art-layer" />
      <div className="product-art-mark">{product.title.slice(0, 2).toUpperCase()}</div>
      <span className="product-art-year">{product.year}</span>
    </div>
  )
}
