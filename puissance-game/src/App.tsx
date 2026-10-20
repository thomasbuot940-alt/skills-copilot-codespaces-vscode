import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { TransitionProvider } from './context/TransitionContext'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Catalog } from './pages/Catalog'
import { ProductPage } from './pages/Product'
import { Cart } from './pages/Cart'
import { About } from './pages/About'

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <TransitionProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="catalogue" element={<Catalog />} />
              <Route path="produit/:slug" element={<ProductPage />} />
              <Route path="panier" element={<Cart />} />
              <Route path="a-propos" element={<About />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </TransitionProvider>
      </CartProvider>
    </BrowserRouter>
  )
}
