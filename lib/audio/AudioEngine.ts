import { cachedTheme } from "@/lib/audio/renderTheme";

export type SfxKind = "hover" | "click" | "tab" | "angel";

type Listener = () => void;

export class AudioEngine {
  private static instance: AudioEngine | null = null;

  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private duckGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private analyser: AnalyserNode | null = null;
  private source: AudioBufferSourceNode | null = null;
  private lfo: OscillatorNode | null = null;
  private fallback: HTMLAudioElement | null = null;
  private mode: "synth" | "file" | "off" = "off";
  private desired = true;
  private running = false;
  private volume = 0.72;
  private ducks = 0;
  private lastHover = 0;
  private listeners = new Set<Listener>();

  static get(): AudioEngine {
    if (!AudioEngine.instance) AudioEngine.instance = new AudioEngine();
    return AudioEngine.instance;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  isDesired(): boolean {
    return this.desired;
  }

  isRunning(): boolean {
    return this.running;
  }

  getVolume(): number {
    return this.volume;
  }

  getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  async unlock(): Promise<void> {
    if (this.desired) await this.start();
  }

  async toggle(): Promise<void> {
    this.desired = !this.desired;
    if (this.desired) await this.start();
    else this.stop();
    this.emit();
  }

  setVolume(value: number): void {
    this.volume = Math.min(1, Math.max(0, value));
    const now = this.ctx?.currentTime ?? 0;
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setTargetAtTime(this.musicLevel(), now, 0.05);
    }
    if (this.fallback) this.fallback.volume = this.volume * 0.45;
    this.emit();
  }

  duck(): void {
    this.ducks += 1;
    this.applyDuck();
  }

  unduck(): void {
    this.ducks = Math.max(0, this.ducks - 1);
    this.applyDuck();
  }

  play(kind: SfxKind): void {
    if (!this.ctx || this.ctx.state !== "running") return;
    const nowMs = performance.now();
    if (kind === "hover") {
      if (nowMs - this.lastHover < 110) return;
      this.lastHover = nowMs;
    }
    if (kind === "hover") this.tone({ freq: 880, to: 1460, dur: 0.07, gain: 0.03 });
    if (kind === "click") {
      this.noise(0.035, 0.05);
      this.tone({ freq: 210, to: 90, dur: 0.06, gain: 0.04, type: "triangle" });
    }
    if (kind === "tab") this.tone({ freq: 420, to: 2200, dur: 0.2, gain: 0.035, type: "sawtooth" });
    if (kind === "angel") {
      this.tone({ freq: 523.25, to: 659.25, dur: 0.32, gain: 0.04 });
      this.tone({ freq: 783.99, to: 987.77, dur: 0.38, gain: 0.028 });
    }
  }

  private async start(): Promise<void> {
    if (this.running && this.mode === "synth" && this.source) return;
    const boot = ++this.bootId;
    await this.startInner(boot);
  }

  private async startInner(boot: number): Promise<void> {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) {
      await this.startFile();
      return;
    }
    try {
      if (!this.ctx) this.ctx = new Ctx();
      if (this.ctx.state === "suspended") await this.ctx.resume();
      if (boot !== this.bootId || !this.desired) return;
      this.ensureGraph();
      this.bindVisibility();
      if (!this.fallback || this.fallback.paused) await this.startFile();
      this.running = true;
      this.mode = "file";
      this.emit();
      await new Promise((resolve) => window.setTimeout(resolve, 40));
      if (boot !== this.bootId || !this.desired) return;
      const rendered = cachedTheme(22050);
      if (boot !== this.bootId || !this.desired || !this.ctx) return;
      if (this.ctx.state === "suspended") await this.ctx.resume();
      const buffer = this.ctx.createBuffer(2, rendered.left.length, 22050);
      buffer.getChannelData(0).set(rendered.left);
      buffer.getChannelData(1).set(rendered.right);
      this.stopSource();
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      source.connect(this.filter!);
      source.start();
      this.source = source;
      this.fallback?.pause();
      this.mode = "synth";
      this.running = true;
      this.emit();
    } catch {
      if (boot === this.bootId && this.desired) await this.startFile();
    }
  }

  private async startFile(): Promise<void> {
    if (!this.fallback) {
      this.fallback = new Audio("/cyberpunk-theme.mp3");
      this.fallback.loop = true;
      this.fallback.preload = "auto";
    }
    this.fallback.volume = this.volume * 0.45;
    try {
      await this.fallback.play();
      this.mode = "file";
      this.running = true;
      this.emit();
    } catch {
      this.running = false;
      this.emit();
    }
  }

  private ensureGraph(): void {
    if (!this.ctx || this.master) return;
    const ctx = this.ctx;
    this.master = ctx.createGain();
    this.master.gain.value = 1;
    this.musicGain = ctx.createGain();
    this.musicGain.gain.value = this.musicLevel();
    this.duckGain = ctx.createGain();
    this.duckGain.gain.value = 1;
    this.sfxGain = ctx.createGain();
    this.sfxGain.gain.value = 0.8;
    this.filter = ctx.createBiquadFilter();
    this.filter.type = "lowpass";
    this.filter.frequency.value = 1400;
    this.filter.Q.value = 0.6;
    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 64;
    this.analyser.smoothingTimeConstant = 0.78;
    const delay = ctx.createDelay();
    delay.delayTime.value = 0.22;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.16;
    const wet = ctx.createGain();
    wet.gain.value = 0.18;
    this.filter.connect(this.musicGain);
    this.filter.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(wet);
    wet.connect(this.musicGain);
    this.musicGain.connect(this.duckGain);
    this.duckGain.connect(this.analyser);
    this.analyser.connect(this.master);
    this.sfxGain.connect(this.master);
    this.master.connect(ctx.destination);
    this.lfo = ctx.createOscillator();
    this.lfo.frequency.value = 0.07;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 380;
    this.lfo.connect(lfoGain);
    lfoGain.connect(this.filter.frequency);
    this.lfo.start();
  }

  private stop(): void {
    this.bootId += 1;
    this.stopSource();
    if (this.fallback) {
      this.fallback.pause();
      this.fallback.currentTime = 0;
    }
    this.running = false;
    this.mode = "off";
    if (this.ctx && this.ctx.state === "running") void this.ctx.suspend();
    this.emit();
  }

  private stopSource(): void {
    if (!this.source) return;
    try {
      this.source.stop();
    } catch {
      /* already stopped */
    }
    this.source.disconnect();
    this.source = null;
  }

  private musicLevel(): number {
    return this.volume * 0.34;
  }

  private applyDuck(): void {
    if (this.fallback && this.mode === "file") {
      this.fallback.volume = (this.ducks > 0 ? 0.2 : 1) * this.volume * 0.45;
    }
    if (!this.ctx || !this.duckGain) return;
    const now = this.ctx.currentTime;
    const target = this.ducks > 0 ? 0.16 : 1;
    this.duckGain.gain.cancelScheduledValues(now);
    this.duckGain.gain.setValueAtTime(this.duckGain.gain.value, now);
    this.duckGain.gain.linearRampToValueAtTime(target, now + (this.ducks > 0 ? 0.28 : 0.7));
  }

  private tone(opts: { freq: number; to?: number; dur: number; gain?: number; type?: OscillatorType }): void {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = opts.type ?? "sine";
    osc.frequency.setValueAtTime(Math.max(40, opts.freq), t);
    if (opts.to) osc.frequency.exponentialRampToValueAtTime(Math.max(40, opts.to), t + opts.dur);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(opts.gain ?? 0.04, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + opts.dur);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + opts.dur + 0.02);
  }

  private noise(duration: number, gainValue: number): void {
    if (!this.ctx || !this.sfxGain) return;
    const frames = Math.max(1, Math.floor(this.ctx.sampleRate * duration));
    const buffer = this.ctx.createBuffer(1, frames, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frames; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    const gain = this.ctx.createGain();
    gain.gain.value = gainValue;
    source.connect(gain);
    gain.connect(this.sfxGain);
    source.start();
  }

  private bindVisibility(): void {
    if (this.visibilityBound) return;
    this.visibilityBound = true;
    document.addEventListener("visibilitychange", () => {
      if (!this.ctx) return;
      if (document.hidden) void this.ctx.suspend();
      else if (this.desired && this.running) void this.ctx.resume();
    });
  }

  private visibilityBound = false;
  private bootId = 0;

  private emit(): void {
    this.listeners.forEach((listener) => listener());
  }
}

export function getAudioEngine(): AudioEngine {
  return AudioEngine.get();
}
