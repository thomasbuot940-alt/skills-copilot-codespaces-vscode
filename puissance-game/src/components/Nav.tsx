import { useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useTransitionNav } from '../context/TransitionContext'

const links = [
  { to: '/', label: 'Accueil' },
  { to: '/catalogue', label: 'Catalogue' },
  { to: '/panier', label: 'Panier' },
  { to: '/a-propos', label: 'À propos' },
]

export function Nav() {
  const { navigateWithRain } = useTransitionNav()
  const { count } = useCart()
  const { pathname } = useLocation()

  return (
    <header className="site-nav">
      <button
        type="button"
        className="nav-brand"
        onClick={() => navigateWithRain('/')}
        aria-label="Puissance Game — accueil"
      >
        <span className="nav-glyph" aria-hidden>
          △
        </span>
        <span className="nav-brand-text">
          Puissance<span>Game</span>
        </span>
      </button>
      <nav aria-label="Principal">
        {links.map((l) => {
          const active =
            l.to === '/'
              ? pathname === '/'
              : pathname === l.to || pathname.startsWith(`${l.to}/`)
          return (
            <button
              key={l.to}
              type="button"
              className={`nav-link ${active ? 'is-active' : ''}`}
              onClick={() => navigateWithRain(l.to)}
            >
              {l.label}
              {l.to === '/panier' && count > 0 ? (
                <span className="nav-badge">{count}</span>
              ) : null}
            </button>
          )
        })}
      </nav>
    </header>
  )
}
