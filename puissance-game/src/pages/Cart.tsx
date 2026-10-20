import { formatYen } from '../data/products'
import { useCart } from '../context/CartContext'
import { useTransitionNav } from '../context/TransitionContext'

export function Cart() {
  const { items, setQty, remove, clear, total } = useCart()
  const { navigateWithRain } = useTransitionNav()

  return (
    <div className="page cart-page">
      <header className="page-hero">
        <p className="eyebrow">カート / WISHLIST</p>
        <h1>Panier</h1>
        <p>Votre sélection — démo panier pour la vitrine (pas de paiement réel).</p>
      </header>

      {items.length === 0 ? (
        <div className="empty-state">
          <p>Panier vide. Chargez un titre depuis le catalogue.</p>
          <button type="button" className="btn btn-primary" onClick={() => navigateWithRain('/catalogue')}>
            Ouvrir le catalogue
          </button>
        </div>
      ) : (
        <>
          <ul className="cart-list">
            {items.map(({ product, qty }) => (
              <li key={product.slug} className="cart-row">
                <button
                  type="button"
                  className="cart-title"
                  onClick={() => navigateWithRain(`/produit/${product.slug}`)}
                >
                  <span>{product.title}</span>
                  <small>{product.titleJa}</small>
                </button>
                <div className="cart-qty">
                  <button type="button" onClick={() => setQty(product.slug, qty - 1)} aria-label="Moins">
                    −
                  </button>
                  <span>{qty}</span>
                  <button type="button" onClick={() => setQty(product.slug, qty + 1)} aria-label="Plus">
                    +
                  </button>
                </div>
                <span className="cart-line-price">{formatYen(product.price * qty)}</span>
                <button type="button" className="cart-remove" onClick={() => remove(product.slug)}>
                  Retirer
                </button>
              </li>
            ))}
          </ul>
          <div className="cart-summary">
            <p>
              Total <strong>{formatYen(total)}</strong>
            </p>
            <div className="product-actions">
              <button type="button" className="btn btn-primary" onClick={() => clear()}>
                Simuler checkout
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => clear()}>
                Vider
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
