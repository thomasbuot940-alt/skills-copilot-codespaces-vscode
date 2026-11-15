import type { Lang } from "@/data/angelCopy";
import { getAudioEngine } from "@/lib/audio/AudioEngine";

export const SPEECH_LANG: Record<Lang, string> = {
  fr: "fr-FR",
  en: "en-US",
  es: "es-ES",
  de: "de-DE",
  it: "it-IT",
  pt: "pt-PT",
  ja: "ja-JP",
  ko: "ko-KR",
  zh: "zh-CN",
  ar: "ar-SA",
};

export const speechState = {
  id: null as string | null,
  ratio: -1,
  active: false,
};

export type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<{ isFinal: boolean; 0?: { transcript: string } }>;
};

type RecognitionCtor = new () => SpeechRecognitionLike;

let unlocked = false;
let pending: { id: string; text: string; lang: Lang } | null = null;
let generation = 0;
let speechDucked = false;
let micDucked = false;
let audioEl: HTMLAudioElement | null = null;

export function setMicDuck(on: boolean) {
  if (on === micDucked) return;
  micDucked = on;
  const engine = getAudioEngine();
  if (on) engine.duck();
  else engine.unduck();
}

function setSpeechDuck(on: boolean) {
  if (on === speechDucked) return;
  speechDucked = on;
  const engine = getAudioEngine();
  if (on) engine.duck();
  else engine.unduck();
}

function pickVoice(lang: string): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis?.getVoices?.() ?? [];
  const base = lang.slice(0, 2).toLowerCase();
  const ranked = voices
    .filter((voice) => voice.lang.toLowerCase().startsWith(base))
    .map((voice) => {
      const name = voice.name.toLowerCase();
      let score = 0;
      if (/female|femme|woman|samantha|amelie|amélie|audrey|victoria|jenny|aria|sara|nova|coral|sophie|marie|google français|kyoko|nanami|yuna/.test(name)) score += 3;
      if (/male|homme|thomas|hugo|paul|daniel|rishi|fred|alex/.test(name)) score -= 3;
      if (voice.lang.toLowerCase() === lang.toLowerCase()) score += 1;
      return { voice, score };
    })
    .sort((a, b) => b.score - a.score);
  return ranked[0]?.voice ?? voices.find((voice) => voice.lang.toLowerCase().startsWith(base)) ?? null;
}

async function speakPremium(id: string, text: string, lang: Lang, token: number): Promise<boolean> {
  const provider = process.env.NEXT_PUBLIC_TTS_PROVIDER;
  if (provider !== "elevenlabs" && provider !== "openai") return false;
  const response = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, lang, provider }),
  });
  const type = response.headers.get("content-type") ?? "";
  if (!response.ok || !type.includes("audio")) return false;
  if (token !== generation) return true;
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  audioEl?.pause();
  const audio = new Audio(url);
  audioEl = audio;
  setSpeechDuck(true);
  speechState.id = id;
  speechState.active = true;
  speechState.ratio = 0;
  audio.ontimeupdate = () => {
    if (token !== generation || !audio.duration) return;
    speechState.ratio = audio.currentTime / audio.duration;
  };
  audio.onended = () => {
    URL.revokeObjectURL(url);
    if (token !== generation) return;
    speechState.ratio = 1;
    speechState.active = false;
    setSpeechDuck(false);
  };
  await audio.play();
  return true;
}

function speakBrowser(id: string, text: string, lang: Lang, token: number) {
  if (!window.speechSynthesis) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = SPEECH_LANG[lang];
  const voice = pickVoice(utterance.lang);
  if (voice) utterance.voice = voice;
  utterance.rate = 0.96;
  utterance.pitch = 1.04;
  utterance.onstart = () => {
    if (token !== generation) return;
    speechState.id = id;
    speechState.active = true;
    speechState.ratio = 0.01;
    setSpeechDuck(true);
  };
  utterance.onboundary = (event) => {
    if (token !== generation || !text.length) return;
    const index = event.charIndex ?? 0;
    speechState.ratio = Math.min(1, index / text.length);
  };
  utterance.onend = () => {
    if (token !== generation) return;
    speechState.ratio = 1;
    speechState.active = false;
    setSpeechDuck(false);
  };
  utterance.onerror = () => {
    if (token !== generation) return;
    speechState.active = false;
    setSpeechDuck(false);
  };
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

export function unlockSpeech() {
  unlocked = true;
  if (!pending) return;
  const next = pending;
  pending = null;
  void speakAngel(next.id, next.text, next.lang);
}

export async function speakAngel(id: string, text: string, lang: Lang) {
  if (!text.trim()) return;
  if (!unlocked) {
    pending = { id, text, lang };
    return;
  }
  const token = ++generation;
  speechState.id = id;
  speechState.ratio = 0;
  speechState.active = true;
  try {
    const premium = await speakPremium(id, text, lang, token);
    if (premium || token !== generation) return;
  } catch {
    /* browser voice below */
  }
  if (token !== generation) return;
  speakBrowser(id, text, lang, token);
}

export function stopAngelVoice() {
  generation += 1;
  pending = null;
  speechState.active = false;
  speechState.ratio = -1;
  audioEl?.pause();
  if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
  setSpeechDuck(false);
}

export function micSupported(): boolean {
  if (typeof window === "undefined") return false;
  const root = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return Boolean(root.SpeechRecognition || root.webkitSpeechRecognition);
}

export function createRecognizer(lang: Lang): SpeechRecognitionLike | null {
  const root = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  const Ctor = root.SpeechRecognition || root.webkitSpeechRecognition;
  if (!Ctor) return null;
  const recognition = new Ctor();
  recognition.lang = SPEECH_LANG[lang];
  recognition.interimResults = true;
  recognition.continuous = false;
  return recognition;
}
