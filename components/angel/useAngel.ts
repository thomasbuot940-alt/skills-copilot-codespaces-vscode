"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { COPY, WELCOME, type Lang } from "@/data/angelCopy";
import { detectLanguage, localAngelReply, type ChatTurn } from "@/lib/angel/localBrain";
import { createRecognizer, micSupported, setMicDuck, speakAngel, speechState, stopAngelVoice, type SpeechRecognitionLike } from "@/lib/angel/speech";
import { extractCursorPrompt, speechText } from "@/lib/angel/text";
import { useSite } from "@/components/site/SiteContext";
import { getAudioEngine } from "@/lib/audio/AudioEngine";

export type AngelMessage = { id: string; role: "user" | "assistant"; content: string };

let welcomeArmed = false;

export function useAngel() {
  const { angelMode, setAngelMode, angelIntent, recruitTick } = useSite();
  const [messages, setMessages] = useState<AngelMessage[]>([{ id: "welcome", role: "assistant", content: WELCOME }]);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true);
  const [listening, setListening] = useState(false);
  const [engine, setEngine] = useState("local");
  const [lang, setLang] = useState<Lang>("fr");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const voiceRef = useRef(true);
  const pendingRef = useRef(false);
  const messagesRef = useRef(messages);
  const modeRef = useRef(angelMode);
  const intentRef = useRef(angelIntent);
  const langRef = useRef(lang);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  messagesRef.current = messages;
  modeRef.current = angelMode;
  intentRef.current = angelIntent;
  langRef.current = lang;

  useEffect(() => {
    let frame = 0;
    const loop = () => {
      setSpeaking((current) => (current === speechState.active ? current : speechState.active));
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (welcomeArmed) return;
    welcomeArmed = true;
    void speakAngel("welcome", speechText(WELCOME), "fr");
  }, []);

  const pushAssistant = useCallback((content: string, speakLang: Lang) => {
    const id = crypto.randomUUID();
    setMessages((current) => [...current, { id, role: "assistant", content }]);
    if (voiceRef.current) void speakAngel(id, speechText(content), speakLang);
  }, []);

  const seenRecruit = useRef(0);
  useEffect(() => {
    if (!recruitTick || seenRecruit.current === recruitTick) return;
    seenRecruit.current = recruitTick;
    pushAssistant(COPY[langRef.current].recruitOpen, langRef.current);
  }, [recruitTick, pushAssistant]);

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || pendingRef.current) return;
    pendingRef.current = true;
    setPending(true);
    setDraft("");
    const history: AngelMessage[] = [...messagesRef.current, { id: crypto.randomUUID(), role: "user", content: trimmed }];
    setMessages(history);
    const found = detectLanguage(trimmed);
    if (found) setLang(found);
    const turns: ChatTurn[] = history.map(({ role, content }) => ({ role, content }));
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: turns, mode: modeRef.current, intent: intentRef.current }),
      });
      const data = await response.json();
      const local = localAngelReply(turns, { mode: modeRef.current, intent: intentRef.current });
      const content = response.ok && typeof data.content === "string" && data.content.trim() ? data.content : local.content;
      const speakLang = (data.lang as Lang | null) || found || local.lang;
      setEngine(typeof data.engine === "string" ? data.engine : "local");
      setLang(speakLang);
      pushAssistant(content, speakLang);
    } catch {
      const local = localAngelReply(turns, { mode: modeRef.current, intent: intentRef.current });
      setEngine("local");
      setLang(local.lang);
      pushAssistant(local.content, local.lang);
    } finally {
      pendingRef.current = false;
      setPending(false);
    }
  }, [pushAssistant]);

  const toggleVoice = () => {
    setVoiceOn((current) => {
      const next = !current;
      voiceRef.current = next;
      if (!next) stopAngelVoice();
      return next;
    });
  };

  const toggleMic = () => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      setMicDuck(false);
      return;
    }
    const recognition = createRecognizer(langRef.current);
    if (!recognition) {
      setNotice(micSupported() ? "Micro indisponible." : "Reconnaissance vocale indisponible sur ce navigateur.");
      return;
    }
    recognition.onresult = (event) => {
      let text = "";
      let final = false;
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        text += event.results[i][0]?.transcript ?? "";
        if (event.results[i].isFinal) final = true;
      }
      setDraft(text);
      if (final && text.trim()) {
        setListening(false);
        setMicDuck(false);
        void send(text);
      }
    };
    recognition.onerror = () => {
      setListening(false);
      setMicDuck(false);
    };
    recognition.onend = () => {
      setListening(false);
      setMicDuck(false);
    };
    recognitionRef.current = recognition;
    setMicDuck(true);
    setListening(true);
    recognition.start();
  };

  const copyPrompt = async (message: AngelMessage) => {
    const prompt = extractCursorPrompt(message.content);
    if (!prompt) return;
    try {
      await navigator.clipboard.writeText(prompt);
      setCopiedId(message.id);
      getAudioEngine().play("click");
      window.setTimeout(() => setCopiedId((current) => (current === message.id ? null : current)), 2000);
    } catch {
      setNotice("Copie impossible dans ce navigateur.");
    }
  };

  const transmit = async () => {
    try {
      const response = await fetch("/api/dossier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messagesRef.current.map(({ role, content }) => ({ role, content })),
          mode: modeRef.current,
          intent: intentRef.current,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setNotice(data.error || "Transmission impossible.");
        return;
      }
      const line = `C'est transmis. Dossier ${data.reference} envoyé à Thomas — il répond par écrit, sans appel.`;
      setNotice(`Dossier ${data.reference} transmis à Thomas.`);
      pushAssistant(line, langRef.current);
      getAudioEngine().play("click");
    } catch {
      setNotice("Transmission impossible.");
    }
  };

  const switchMode = () => {
    const next = angelMode === "public" ? "studio" : "public";
    setAngelMode(next);
    const line = next === "studio"
      ? "Mode Studio activé. Décrivez le projet client : je vous donne la marche à suivre et le prompt Cursor prêt à coller."
      : "Mode clients activé. Je reprends l'accueil des visiteurs.";
    pushAssistant(line, "fr");
    getAudioEngine().play("click");
  };

  return {
    messages,
    draft,
    setDraft,
    pending,
    voiceOn,
    toggleVoice,
    listening,
    toggleMic,
    engine,
    lang,
    copiedId,
    notice,
    speaking,
    send,
    copyPrompt,
    transmit,
    switchMode,
    quick: COPY[lang].quick,
    mode: angelMode,
  };
}
