import { useEffect, useRef } from 'react'

type Props = { active: boolean }

export function BinaryRain({ active }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const cols = Math.ceil(window.innerWidth / 18)
    const drops = Array.from({ length: cols }, () => Math.random() * -40)
    const glyphs = ['0', '1']

    const draw = () => {
      ctx.fillStyle = 'rgba(7, 9, 13, 0.18)'
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)
      ctx.font = '15px "Share Tech Mono", monospace'

      for (let i = 0; i < drops.length; i++) {
        const ch = glyphs[Math.floor(Math.random() * 2)]!
        const x = i * 18
        const y = drops[i]! * 18
        const bright = Math.random() > 0.92
        ctx.fillStyle = bright ? '#C8FF3C' : '#00E5FF'
        ctx.globalAlpha = bright ? 0.95 : 0.55 + Math.random() * 0.35
        ctx.fillText(ch, x, y)
        if (y > window.innerHeight && Math.random() > 0.975) {
          drops[i] = 0
        } else {
          drops[i]! += 0.85 + Math.random() * 0.6
        }
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [active])

  return (
    <div className={`binary-rain ${active ? 'is-active' : ''}`} aria-hidden={!active}>
      <canvas ref={canvasRef} />
    </div>
  )
}
