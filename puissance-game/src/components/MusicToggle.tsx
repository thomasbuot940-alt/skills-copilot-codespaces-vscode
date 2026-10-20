import { useEffect, useState } from 'react'
import { cyberAmbient } from '../audio/cyberAmbient'

export function MusicToggle() {
  const [on, setOn] = useState(false)

  useEffect(() => {
    return () => {
      cyberAmbient.stop()
    }
  }, [])

  const toggle = async () => {
    if (on) {
      cyberAmbient.stop()
      setOn(false)
    } else {
      await cyberAmbient.start()
      setOn(true)
    }
  }

  return (
    <button
      type="button"
      className={`music-toggle ${on ? 'is-on' : ''}`}
      onClick={() => void toggle()}
      aria-pressed={on}
      title="Ambiance cyber générative (Web Audio)"
    >
      <span className="music-bars" aria-hidden>
        <i />
        <i />
        <i />
      </span>
      {on ? 'Ambiance ON' : 'Ambiance'}
    </button>
  )
}
