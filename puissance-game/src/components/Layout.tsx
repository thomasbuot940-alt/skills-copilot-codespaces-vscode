import { Outlet } from 'react-router-dom'
import { Nav } from './Nav'
import { BinaryRain } from './BinaryRain'
import { ChatBot } from './ChatBot'
import { MusicToggle } from './MusicToggle'
import { useTransitionNav } from '../context/TransitionContext'

export function Layout() {
  const { raining } = useTransitionNav()

  return (
    <div className="app-shell">
      <div className="atmosphere" aria-hidden />
      <Nav />
      <main className="main-stage">
        <Outlet />
      </main>
      <footer className="site-footer">
        <p>
          <span className="brand-mark">Puissance Game</span>
          <span className="ja">ピュイサンス・ゲーム</span>
        </p>
        <p className="footer-note">
          Vitrine portfolio — musique générative Web Audio (libre). Pas de titres protégés.
        </p>
      </footer>
      <MusicToggle />
      <ChatBot />
      <BinaryRain active={raining} />
    </div>
  )
}
