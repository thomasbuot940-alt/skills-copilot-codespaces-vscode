/**
 * Generative cyber/tech ambient — original Web Audio synthesis.
 * No samples, no copyrighted tracks (never Cyberpunk 2077 or similar).
 */
export class CyberAmbient {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private nodes: AudioNode[] = []
  private timers: number[] = []
  private playing = false

  get isPlaying() {
    return this.playing
  }

  async start() {
    if (this.playing) return
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    this.ctx = new Ctx()
    if (this.ctx.state === 'suspended') await this.ctx.resume()

    this.master = this.ctx.createGain()
    this.master.gain.value = 0
    this.master.connect(this.ctx.destination)

    const filter = this.ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 900
    filter.Q.value = 0.7
    filter.connect(this.master)
    this.nodes.push(filter)

    // Deep drone (D2)
    this.makeDrone(73.42, 0.045, filter)
    // Fifth above
    this.makeDrone(110, 0.025, filter)

    // Soft pulse pad
    this.makePulse(146.83, filter)

    // Sparse arp in D minor pentatonic-ish
    const notes = [146.83, 174.61, 220, 261.63, 293.66, 349.23]
    let i = 0
    const tick = () => {
      if (!this.ctx || !this.playing) return
      const osc = this.ctx.createOscillator()
      const g = this.ctx.createGain()
      const f = this.ctx.createBiquadFilter()
      osc.type = 'triangle'
      osc.frequency.value = notes[i % notes.length]! * (i % 7 === 0 ? 0.5 : 1)
      f.type = 'bandpass'
      f.frequency.value = 1200 + (i % 5) * 180
      f.Q.value = 2
      g.gain.setValueAtTime(0, this.ctx.currentTime)
      g.gain.linearRampToValueAtTime(0.035, this.ctx.currentTime + 0.02)
      g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.55)
      osc.connect(f)
      f.connect(g)
      g.connect(filter)
      osc.start()
      osc.stop(this.ctx.currentTime + 0.6)
      i += 1
      this.timers.push(window.setTimeout(tick, 420 + (i % 3) * 110))
    }

    // Occasional noise burst (glitch texture)
    const glitch = () => {
      if (!this.ctx || !this.playing || !this.master) return
      const bufferSize = this.ctx.sampleRate * 0.08
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let n = 0; n < bufferSize; n++) {
        data[n] = (Math.random() * 2 - 1) * (1 - n / bufferSize) * 0.15
      }
      const src = this.ctx.createBufferSource()
      src.buffer = buffer
      const hp = this.ctx.createBiquadFilter()
      hp.type = 'highpass'
      hp.frequency.value = 2400
      const g = this.ctx.createGain()
      g.gain.value = 0.04
      src.connect(hp)
      hp.connect(g)
      g.connect(this.master)
      src.start()
      this.timers.push(window.setTimeout(glitch, 2800 + Math.random() * 4200))
    }

    // Slow filter sweep
    const sweep = () => {
      if (!this.ctx || !this.playing) return
      const now = this.ctx.currentTime
      filter.frequency.cancelScheduledValues(now)
      filter.frequency.setValueAtTime(filter.frequency.value, now)
      filter.frequency.linearRampToValueAtTime(600 + Math.random() * 1400, now + 4)
      this.timers.push(window.setTimeout(sweep, 4500))
    }

    this.playing = true
    const now = this.ctx.currentTime
    this.master.gain.linearRampToValueAtTime(0.55, now + 1.2)
    tick()
    glitch()
    sweep()
  }

  stop() {
    if (!this.playing) return
    this.playing = false
    this.timers.forEach((t) => clearTimeout(t))
    this.timers = []
    if (this.master && this.ctx) {
      const now = this.ctx.currentTime
      this.master.gain.cancelScheduledValues(now)
      this.master.gain.linearRampToValueAtTime(0, now + 0.4)
    }
    window.setTimeout(() => this.dispose(), 500)
  }

  private makeDrone(freq: number, gain: number, dest: AudioNode) {
    if (!this.ctx) return
    const osc = this.ctx.createOscillator()
    const g = this.ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    // subtle detune LFO via second osc
    const lfo = this.ctx.createOscillator()
    const lfoGain = this.ctx.createGain()
    lfo.frequency.value = 0.08 + Math.random() * 0.06
    lfoGain.gain.value = 4
    lfo.connect(lfoGain)
    lfoGain.connect(osc.frequency)
    g.gain.value = gain
    osc.connect(g)
    g.connect(dest)
    osc.start()
    lfo.start()
    this.nodes.push(osc, g, lfo, lfoGain)
  }

  private makePulse(freq: number, dest: AudioNode) {
    if (!this.ctx) return
    const osc = this.ctx.createOscillator()
    const g = this.ctx.createGain()
    osc.type = 'sawtooth'
    osc.frequency.value = freq
    const lfo = this.ctx.createOscillator()
    const lfoGain = this.ctx.createGain()
    lfo.type = 'sine'
    lfo.frequency.value = 0.25
    lfoGain.gain.value = 0.018
    lfo.connect(lfoGain)
    lfoGain.connect(g.gain)
    g.gain.value = 0.012
    const lp = this.ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 400
    osc.connect(lp)
    lp.connect(g)
    g.connect(dest)
    osc.start()
    lfo.start()
    this.nodes.push(osc, g, lfo, lfoGain, lp)
  }

  private dispose() {
    this.nodes.forEach((n) => {
      try {
        if ('stop' in n && typeof (n as OscillatorNode).stop === 'function') {
          ;(n as OscillatorNode).stop()
        }
        n.disconnect()
      } catch {
        /* already stopped */
      }
    })
    this.nodes = []
    void this.ctx?.close()
    this.ctx = null
    this.master = null
  }
}

export const cyberAmbient = new CyberAmbient()
