import { useMemo, useState } from 'react'
import { products } from '../data/products'
import { ProductCard } from '../components/ProductCard'

const genres = ['Tous', ...Array.from(new Set(products.map((p) => p.genre)))]

export function Catalog() {
  const [genre, setGenre] = useState('Tous')
  const [q, setQ] = useState('')

  const list = useMemo(() => {
    return products.filter((p) => {
      const gOk = genre === 'Tous' || p.genre === genre
      const hay = `${p.title} ${p.titleJa} ${p.tagline} ${p.tags.join(' ')}`.toLowerCase()
      const qOk = !q || hay.includes(q.toLowerCase())
      return gOk && qOk
    })
  }, [genre, q])

  return (
    <div className="page catalog-page">
      <header className="page-hero">
        <p className="eyebrow">カタログ</p>
        <h1>Catalogue</h1>
        <p>Filtrez par genre ou cherchez un signal — chaque clic déclenche la pluie binaire.</p>
      </header>

      <div className="catalog-controls">
        <label className="search-field">
          <span className="sr-only">Recherche</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Neon, ronin, coop…"
          />
        </label>
        <div className="genre-filters" role="group" aria-label="Genres">
          {genres.map((g) => (
            <button
              key={g}
              type="button"
              className={genre === g ? 'is-active' : ''}
              onClick={() => setGenre(g)}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className="product-grid">
        {list.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      {list.length === 0 && <p className="empty-state">Aucun titre sur cette fréquence.</p>}
    </div>
  )
}
