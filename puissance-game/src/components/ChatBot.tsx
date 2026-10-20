import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { products } from '../data/products'
import { useTransitionNav } from '../context/TransitionContext'

type Msg = { from: 'bot' | 'user'; text: string }

const GREETING =
  'ブート完了。 Salut — je suis PULSE, conseiller Puissance Game. Quel type de session cherchez-vous ?'

const SUGGESTIONS = [
  { label: 'Action rapide', query: 'action' },
  { label: 'Narratif / immersion', query: 'narratif' },
  { label: 'Team / coop', query: 'coop' },
  { label: 'Horreur tech', query: 'horreur' },
]

function advise(query: string): { text: string; slug?: string } {
  const q = query.toLowerCase()
  if (q.includes('action') || q.includes('combat') || q.includes('rapide')) {
    return {
      text: `Pour une session arcade vive : **${products[1]!.title}** (${products[1]!.titleJa}). Combos + boss rush — idéal entre deux meetings.`,
      slug: products[1]!.slug,
    }
  }
  if (q.includes('narratif') || q.includes('histoir') || q.includes('immersion') || q.includes('solo')) {
    return {
      text: `Plongez dans **${products[0]!.title}** — infiltration Neo-Osaka, choix lourds. Ou **${products[3]!.title}** si vous voulez du frisson kernel.`,
      slug: products[0]!.slug,
    }
  }
  if (q.includes('coop') || q.includes('team') || q.includes('équipe') || q.includes('multi')) {
    return {
      text: `Pour une équipe startup : **${products[4]!.title}** (stratégie orbitale) ou **${products[5]!.title}** en co-op local. Parfait pour un game night.`,
      slug: products[4]!.slug,
    }
  }
  if (q.includes('horreur') || q.includes('peur') || q.includes('ghost')) {
    return {
      text: `**${products[3]!.title}** — horreur systémique, audio binaural. Pas pour la pause déjeuner.`,
      slug: products[3]!.slug,
    }
  }
  if (q.includes('course') || q.includes('racing') || q.includes('vitesse')) {
    return {
      text: `**${products[2]!.title}** : drifts sur autoroutes de données. Tuning + ghosts.`,
      slug: products[2]!.slug,
    }
  }
  return {
    text: 'Dites-moi : action, narratif, coop, horreur ou course — je vous guide vers le bon titre du catalogue.',
  }
}

function renderText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    return <span key={i}>{part}</span>
  })
}

export function ChatBot() {
  const { navigateWithRain } = useTransitionNav()
  const [visible, setVisible] = useState(false)
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [pendingSlug, setPendingSlug] = useState<string | undefined>()

  useEffect(() => {
    const appear = window.setTimeout(() => {
      setVisible(true)
      setOpen(true)
      setMsgs([{ from: 'bot', text: GREETING }])
    }, 2800)
    // Collapse to FAB so CTAs (panier, etc.) stay clickable
    const collapse = window.setTimeout(() => setOpen(false), 9000)
    return () => {
      clearTimeout(appear)
      clearTimeout(collapse)
    }
  }, [])

  const pushAdvice = (query: string) => {
    const advice = advise(query)
    setMsgs((m) => [
      ...m,
      { from: 'user', text: query },
      { from: 'bot', text: advice.text },
    ])
    setPendingSlug(advice.slug)
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const q = input.trim()
    if (!q) return
    setInput('')
    pushAdvice(q)
  }

  const panelClass = useMemo(
    () => `chatbot ${visible ? 'is-visible' : ''} ${open ? 'is-open' : ''}`,
    [visible, open],
  )

  if (!visible) return null

  return (
    <div className={panelClass}>
      {!open && (
        <button
          type="button"
          className="chatbot-fab"
          onClick={() => setOpen(true)}
          aria-label="Ouvrir PULSE"
        >
          PULSE
        </button>
      )}
      {open && (
        <div className="chatbot-panel" role="dialog" aria-label="Conseiller PULSE">
          <header className="chatbot-head">
            <div>
              <span className="chatbot-status" />
              <strong>PULSE</strong>
              <span className="chatbot-sub">アドバイス・モジュール</span>
            </div>
            <button type="button" className="chatbot-close" onClick={() => setOpen(false)} aria-label="Fermer">
              ×
            </button>
          </header>
          <div className="chatbot-body">
            {msgs.map((m, i) => (
              <p key={i} className={`chat-msg chat-msg--${m.from}`}>
                {renderText(m.text)}
              </p>
            ))}
            {pendingSlug && (
              <button
                type="button"
                className="chatbot-cta"
                onClick={() => navigateWithRain(`/produit/${pendingSlug}`)}
              >
                Voir le titre →
              </button>
            )}
          </div>
          <div className="chatbot-suggestions">
            {SUGGESTIONS.map((s) => (
              <button key={s.query} type="button" onClick={() => pushAdvice(s.label)}>
                {s.label}
              </button>
            ))}
          </div>
          <form className="chatbot-form" onSubmit={onSubmit}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ex. coop pour mon équipe…"
              aria-label="Votre besoin"
            />
            <button type="submit">OK</button>
          </form>
        </div>
      )}
    </div>
  )
}
