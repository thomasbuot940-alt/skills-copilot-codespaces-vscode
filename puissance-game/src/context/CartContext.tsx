import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { products, type Product } from '../data/products'

type CartItem = { product: Product; qty: number }

type CartContextValue = {
  items: CartItem[]
  add: (slug: string) => void
  remove: (slug: string) => void
  setQty: (slug: string, qty: number) => void
  clear: () => void
  count: number
  total: number
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  const value = useMemo<CartContextValue>(() => {
    const add = (slug: string) => {
      const product = products.find((p) => p.slug === slug)
      if (!product) return
      setItems((prev) => {
        const existing = prev.find((i) => i.product.slug === slug)
        if (existing) {
          return prev.map((i) =>
            i.product.slug === slug ? { ...i, qty: i.qty + 1 } : i,
          )
        }
        return [...prev, { product, qty: 1 }]
      })
    }

    const remove = (slug: string) => {
      setItems((prev) => prev.filter((i) => i.product.slug !== slug))
    }

    const setQty = (slug: string, qty: number) => {
      if (qty <= 0) {
        remove(slug)
        return
      }
      setItems((prev) =>
        prev.map((i) => (i.product.slug === slug ? { ...i, qty } : i)),
      )
    }

    const clear = () => setItems([])
    const count = items.reduce((s, i) => s + i.qty, 0)
    const total = items.reduce((s, i) => s + i.product.price * i.qty, 0)

    return { items, add, remove, setQty, clear, count, total }
  }, [items])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
