const TWO_PI = Math.PI * 2;

function wrap(phase: number): number {
  return phase > TWO_PI ? phase - TWO_PI : phase;
}

function hash(index: number): number {
  const x = Math.sin(index * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

const themeCache = new Map<number, { left: Float32Array; right: Float32Array }>();

export function cachedTheme(sampleRate: number): { left: Float32Array; right: Float32Array } {
  const hit = themeCache.get(sampleRate);
  if (hit) return hit;
  const rendered = renderCyberTheme(sampleRate);
  themeCache.set(sampleRate, rendered);
  return rendered;
}

export function prewarmThemes(): void {
  cachedTheme(48000);
  cachedTheme(44100);
}

/** Original dark-synth pad rendered once, then looped by the Web Audio graph. */
export function renderCyberTheme(sampleRate: number): { left: Float32Array; right: Float32Array } {
  const bpm = 90;
  const beat = 60 / bpm;
  const bars = 8;
  const barDuration = beat * 4;
  const n = Math.floor(barDuration * bars * sampleRate);
  const left = new Float32Array(n);
  const right = new Float32Array(n);

  const chords = [
    [146.832, 174.614, 220],
    [146.832, 174.614, 220],
    [116.541, 146.832, 174.614],
    [116.541, 146.832, 174.614],
    [174.614, 220, 261.626],
    [174.614, 220, 261.626],
    [130.813, 164.814, 196],
    [130.813, 164.814, 196],
  ];
  const bassNotes = [73.416, 73.416, 58.27, 58.27, 87.307, 87.307, 65.406, 65.406];
  const padF = chords[0].slice();
  let bassF = bassNotes[0];
  const padPhase = [0, 0, 0, 0, 0, 0];
  const bassPhase = [0, 0];
  let arpPhase = 0;
  const detune = [1, 1.004, 0.996, 2, 0.5, 1.498];

  for (let i = 0; i < n; i += 1) {
    const t = i / sampleRate;
    const bar = Math.min(bars - 1, Math.floor(t / barDuration));
    const target = chords[bar];
    for (let h = 0; h < 3; h += 1) padF[h] += (target[h] - padF[h]) * 0.0016;
    bassF += (bassNotes[bar] - bassF) * 0.0022;

    let pad = 0;
    const bases = [padF[0], padF[1], padF[2], padF[0], padF[0], padF[2]];
    for (let h = 0; h < 6; h += 1) {
      padPhase[h] = wrap(padPhase[h] + (TWO_PI * bases[h] * detune[h]) / sampleRate);
      const weight = h < 3 ? 0.2 : 0.055;
      pad += Math.sin(padPhase[h]) * weight;
    }
    const trem = 0.84 + 0.16 * Math.sin(TWO_PI * 0.09 * t);
    const beatPos = (t % beat) / beat;
    const pump = 1 - 0.16 * Math.exp(-beatPos * 7);
    pad *= trem * pump;

    bassPhase[0] = wrap(bassPhase[0] + (TWO_PI * bassF) / sampleRate);
    bassPhase[1] = wrap(bassPhase[1] + (TWO_PI * bassF * 2) / sampleRate);
    const beatInBar = Math.floor((t / beat) % 4);
    const strong = beatInBar % 2 === 0 ? 1 : 0.42;
    const bassEnv = Math.exp(-beatPos * 3.4) * strong;
    const bass = (Math.sin(bassPhase[0]) * 0.62 + Math.sin(bassPhase[1]) * 0.08) * bassEnv;

    const eighth = beat / 2;
    const step = Math.floor(t / eighth);
    const local = (t % eighth) / eighth;
    const tone = target[step % 3] * (step % 5 === 4 ? 2 : 1);
    arpPhase = wrap(arpPhase + (TWO_PI * tone) / sampleRate);
    const arpEnv = (local < 0.015 ? local / 0.015 : 1) * Math.exp(-local * 4.6);
    const arp = Math.sin(arpPhase) * 0.11 * arpEnv;
    const air = (hash(i) - 0.5) * 0.012;

    const mono = pad * 0.42 + bass * 0.55 + arp + air;
    const side = Math.sin(padPhase[1] + 0.4) * 0.035;
    left[i] = Math.tanh(mono + side);
    right[i] = Math.tanh(mono - side);
  }

  let peak = 0.0001;
  for (let i = 0; i < n; i += 1) peak = Math.max(peak, Math.abs(left[i]), Math.abs(right[i]));
  const gain = 0.86 / peak;
  const fade = Math.floor(sampleRate * 0.05);
  for (let i = 0; i < n; i += 1) {
    let edge = 1;
    if (i < fade) edge = i / fade;
    else if (i > n - fade) edge = (n - i) / fade;
    left[i] *= gain * edge;
    right[i] *= gain * edge;
  }
  return { left, right };
}
