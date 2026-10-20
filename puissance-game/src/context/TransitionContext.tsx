import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useNavigate } from 'react-router-dom'

type TransitionContextValue = {
  raining: boolean
  navigateWithRain: (to: string) => void
}

const TransitionContext = createContext<TransitionContextValue | null>(null)

export function TransitionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [raining, setRaining] = useState(false)
  const lock = useRef(false)

  const navigateWithRain = useCallback(
    (to: string) => {
      if (lock.current) return
      if (window.location.pathname === to) return
      lock.current = true
      setRaining(true)
      window.setTimeout(() => {
        navigate(to)
        window.setTimeout(() => {
          setRaining(false)
          lock.current = false
        }, 420)
      }, 480)
    },
    [navigate],
  )

  return (
    <TransitionContext.Provider value={{ raining, navigateWithRain }}>
      {children}
    </TransitionContext.Provider>
  )
}

export function useTransitionNav() {
  const ctx = useContext(TransitionContext)
  if (!ctx) throw new Error('useTransitionNav requires TransitionProvider')
  return ctx
}
