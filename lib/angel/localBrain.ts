import { COPY, WELCOME, type Lang, type Reco } from "@/data/angelCopy";

export type ChatTurn = { role: "user" | "assistant"; content: string };

export type AngelMode = "public" | "studio";

type Track = "client" | "recruit";

type State = {
  lang: Lang;
  track: Track;
  name: string;
  need: string;
  features: string;
  delay: string;
  email: string;
  company: string;
  role: string;
  notes: string;
};

const NAME_STOP = new Set([
  "intéressé", "interesse", "looking", "here", "busy", "ready", "sure", "yes", "no", "oui", "non",
  "un", "une", "the", "a", "an", "here",
]);

const PHRASES: Array<[RegExp, Lang]> = [
  [/こんにちは|よろしく|です|ます/, "ja"],
  [/안녕하세요|입니다|습니다/, "ko"],
  [/你好|请问|需要|网站/, "zh"],
  [/مرحبا|أريد|سعر|مشروع/, "ar"],
  [/je m'appelle|bonjour|bonsoir|enchant[ée]|s'il vous|quel délai|recrutement/i, "fr"],
  [/\b(hello|hi|hey|my name is|i need|i want|we are|we're|hiring|timeline|website)\b/i, "en"],
  [/hola|necesito|quiero|presupuesto|llamo/i, "es"],
  [/hallo|ich brauche|ich möchte|ich mochte|preise/i, "de"],
  [/ciao|vorrei|ho bisogno|mi chiamo/i, "it"],
  [/olá|ola|preciso|quero|meu nome/i, "pt"],
];

const LEX: Record<Lang, string[]> = {
  fr: ["bonjour", "merci", "projet", "voudrais", "besoin", "avec", "pour", "fonction", "délai", "delai", "site", "recrute"],
  en: ["hello", "please", "project", "need", "would", "hiring", "with", "delay", "website", "script", "company", "want"],
  es: ["hola", "necesito", "quiero", "sitio", "plazo", "gracias", "proyecto", "funciones"],
  de: ["hallo", "brauche", "danke", "projekt", "frist", "unternehmen", "website"],
  it: ["ciao", "vorrei", "bisogno", "grazie", "progetto", "funzioni", "sito"],
  pt: ["preciso", "quero", "obrigado", "projeto", "prazo", "empresa", "site"],
  ja: ["です", "ます", "サイト", "お願い"],
  ko: ["합니다", "사이트", "필요"],
  zh: ["网站", "需要", "项目"],
  ar: ["مشروع", "موقع", "أريد"],
};

export function detectLanguage(text: string): Lang | null {
  if (/[\u3040-\u30ff]/.test(text)) return "ja";
  if (/[\uac00-\ud7af]/.test(text)) return "ko";
  if (/[\u0600-\u06ff]/.test(text)) return "ar";
  if (/[\u4e00-\u9fff]/.test(text)) return "zh";
  for (const [pattern, lang] of PHRASES) {
    if (pattern.test(text)) return lang;
  }
  const scores = new Map<Lang, number>();
  const tokens = text.toLowerCase().match(/[\p{L}\p{N}']+/gu) ?? [];
  for (const token of tokens) {
    (Object.keys(LEX) as Lang[]).forEach((lang) => {
      if (LEX[lang].includes(token)) scores.set(lang, (scores.get(lang) ?? 0) + 1);
    });
  }
  let best: Lang | null = null;
  let bestScore = 0;
  let second = 0;
  scores.forEach((score, lang) => {
    if (score > bestScore) {
      second = bestScore;
      bestScore = score;
      best = lang;
    } else if (score > second) second = score;
  });
  if (!best || bestScore === 0) return null;
  if (bestScore === second && bestScore < 2) return null;
  return best;
}

function extractEmail(text: string): string | null {
  return text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ?? null;
}

function isRecruit(text: string): boolean {
  return /recrut|embauche|cdi|cdd|\bhire\b|\bhiring\b|\bjob\b|poste|opportunit|talent|startup|採用|招聘|채용|contratación|zusammenarbeit|miss[aã]o|missione/i.test(text);
}

function isGreeting(text: string): boolean {
  return /^(bonjour|salut|hello|hi|hey|bonsoir|coucou|hola|hallo|ciao|ol[aá]|こんにちは|안녕하세요|你好|مرحبا)[!！. ]*$/i.test(text.trim());
}

function isPurePricing(text: string): boolean {
  return text.trim().length < 80 && /prix|tarif|offre|combien|pricing|how much|price|cu[aá]nto|precio|preis|prezzo|preços|precos|料金|가격|价格|الأسعار|الأسعار/i.test(text);
}

function hasProjectSignal(text: string): boolean {
  return /site|web|python|script|ia\b|ai\b|bot|landing|automat|scrap|assistant|アプリ|サイト|网站|사이트|موقع|sistema|app/i.test(text);
}

function looksLikeName(text: string): boolean {
  if (hasProjectSignal(text) || isPurePricing(text) || isRecruit(text) || isGreeting(text)) return false;
  const words = text.trim().split(/\s+/);
  return words.length > 0 && words.length <= 3 && text.trim().length <= 40 && !/[0-9@?]/.test(text);
}

function recruitResidue(text: string): string {
  return text
    .replace(/je recrute(?:\s+thomas)?(?:\s+pour\s+une\s+mission\s+tech)?/gi, "")
    .replace(/\b(we are hiring|we're hiring|i am hiring|i'm hiring|hiring)\b/gi, "")
    .replace(/採用したいです。?|を採用したいです。?|채용하고 싶습니다\.?/g, "")
    .replace(/^[\s,.:;\-]+|[\s,.:;\-]+$/g, "")
    .trim();
}

function splitIntro(text: string): { name?: string; rest?: string } {
  const match = text.match(/(?:je m'appelle|je suis|moi c'est|mon prénom est|mon prenom est|my name is|i am|i'm|me llamo|ich hei(?:ß|ss)e|mi chiamo|meu nome é|meu nome e|私は)\s+([A-Za-zÀ-ÿ'’\-]{2,})/i);
  if (!match) return {};
  const name = match[1];
  if (NAME_STOP.has(name.toLowerCase())) return {};
  const rest = text.replace(match[0], "").replace(/^[\s,.:;\-]+/, "").trim();
  return { name, rest: rest.length > 2 ? rest : undefined };
}

function recommend(blob: string, track: Track): Reco {
  if (track === "recruit") return "recruit";
  const text = blob.toLowerCase();
  const enterprise = /application complète|application complete|architecture|déploiement|deploiement|deployment|saas|plateforme complète|full app|enterprise|デプロイ|部署/;
  const starter = /script|scrap|landing|automat|bot|automation|page web simple|スクリプト|脚本|سكربت/;
  const full = /site|assistant|système complet|systeme complet|e-?commerce|paiement|payment|database|base de données|web \+ ia|website|网站|サイト|사이트|موقع/;
  if (enterprise.test(text) && !starter.test(text)) return "enterprise";
  if (full.test(text)) return "pro";
  if (starter.test(text)) return "starter";
  return "pro";
}

function blankState(intent: Track): State {
  return {
    lang: "fr",
    track: intent,
    name: "",
    need: "",
    features: "",
    delay: "",
    email: "",
    company: "",
    role: "",
    notes: "",
  };
}

function absorb(state: State, raw: string) {
  const foundLang = detectLanguage(raw);
  if (foundLang) state.lang = foundLang;
  if (isRecruit(raw)) state.track = "recruit";
  const email = extractEmail(raw);
  if (email) state.email = email;
  const cleaned = raw.replace(email ?? "", "").replace(/\s+/g, " ").trim();
  if (!cleaned || isGreeting(cleaned)) return;
  if (isPurePricing(cleaned) && !hasProjectSignal(cleaned)) return;
  const intro = splitIntro(cleaned);
  if (intro.name && !state.name) state.name = intro.name;
  const payload = (intro.rest ?? (intro.name ? "" : cleaned)).trim();
  if (!payload) return;
  if (state.track === "recruit") {
    const usable = recruitResidue(payload);
    if (!usable) return;
    if (!state.name && looksLikeName(usable)) state.name = usable;
    else if (!state.company) state.company = usable;
    else if (!state.role) state.role = usable;
    else state.notes = state.notes ? `${state.notes}\n${usable}` : usable;
    return;
  }
  if (!state.name && looksLikeName(payload)) state.name = payload;
  else if (!state.need) state.need = payload;
  else if (!state.features) state.features = payload;
  else if (!state.delay) state.delay = payload;
  else state.notes = state.notes ? `${state.notes}\n${payload}` : payload;
}

function frenchDossier(state: State, reco: Reco): string {
  const recText: Record<Reco, string> = {
    starter: "Pack Starter — 149 € (paiement unique). Script, automatisation, scraping ou landing.",
    pro: "Pack Pro — 397 € (ou 2x 209 €). Système web + IA, le plus choisi. Base de données et paiement sécurisé.",
    enterprise: "Pack Enterprise — 797 € (paiement unique). Application, automatisations Python avancées, déploiement.",
    recruit: "Recrutement / mission — TJM 350 €/jour, ouverture aux postes tech, à distance, France et international.",
  };
  const lines = [
    `Nom : ${state.name || "non précisé"}`,
    state.track === "recruit" ? `Structure : ${state.company || "non précisée"}` : `Besoin : ${state.need || "non précisé"}`,
    state.track === "recruit" ? `Poste / mission : ${state.role || "non précisé"}` : `Fonctions : ${state.features || "non précisées"}`,
    state.track === "recruit" ? `Notes : ${state.notes || "—"}` : `Délai : ${state.delay || "non précisé"}`,
    `Email : ${state.email || "non précisé"}`,
    `Recommandation : ${recText[reco]}`,
    "Option possible : Hébergement, maintenance & évolution IA — 49 €/mois.",
    "Canal : 100 % écrit, sans appel.",
  ];
  if (state.track !== "recruit" && state.notes) lines.push(`Notes : ${state.notes}`);
  return lines.join("\n");
}

function nextQuestion(state: State): string | null {
  const copy = COPY[state.lang];
  if (state.track === "recruit") {
    if (!state.name) return copy.askName;
    if (!state.company) return copy.askCompany(state.name);
    if (!state.role) return copy.askRole;
    if (!state.email) return copy.askEmail;
    return null;
  }
  if (!state.name && !state.need) return copy.askName;
  if (!state.need) return copy.askNeed(state.name);
  if (!state.name) return copy.askName;
  if (!state.features) return copy.askFeatures;
  if (!state.delay) return copy.askDelay;
  if (!state.email) return copy.askEmail;
  return null;
}

function summary(state: State, reco: Reco): string {
  const copy = COPY[state.lang];
  const lines = [copy.summaryHello(state.name)];
  if (state.track === "recruit") {
    lines.push(`${copy.labels.company} : ${state.company || "—"}`);
    lines.push(`${copy.labels.role} : ${state.role || "—"}`);
  } else {
    lines.push(`${copy.labels.need} : ${state.need}`);
    lines.push(`${copy.labels.features} : ${state.features}`);
    lines.push(`${copy.labels.delay} : ${state.delay}`);
  }
  lines.push(`${copy.labels.email} : ${state.email}`);
  if (state.notes) lines.push(state.notes);
  lines.push("");
  lines.push(copy.rec[reco]);
  lines.push("");
  lines.push("— Version française pour Thomas —");
  lines.push(frenchDossier(state, reco));
  return lines.join("\n");
}

function studio(users: string[], lang: Lang): string {
  const brief = users.slice(-4).join("\n").trim() || "Projet client à cadrer : cible, fonctions indispensables, délai, contraintes.";
  const copy = COPY[lang];
  const steps = copy.studioSteps.map((step, index) => `${index + 1}. ${step}`).join("\n");
  return `${copy.studioLead}\n\n${steps}\n\n\`\`\`cursor\n${copy.studioPrompt(brief)}\n\`\`\``;
}

function wantsStudio(text: string): boolean {
  return /prompt cursor|mode studio|que dois-je faire|what should i do|marche à suivre/i.test(text);
}

export function localAngelReply(
  messages: ChatTurn[],
  options: { mode: AngelMode; intent?: "client" | "recruit" },
): { content: string; lang: Lang; engine: "local" } {
  const users = messages.filter((message) => message.role === "user").map((message) => message.content.trim()).filter(Boolean);
  const latest = users[users.length - 1] ?? "";
  const langGuess = [...users].reverse().map(detectLanguage).find((lang): lang is Lang => Boolean(lang)) ?? "fr";
  if (options.mode === "studio" || wantsStudio(latest)) {
    return { content: studio(users, langGuess), lang: langGuess, engine: "local" };
  }
  const state = blankState(options.intent === "recruit" ? "recruit" : "client");
  users.forEach((line) => absorb(state, line));
  if (!users.length) return { content: WELCOME, lang: "fr", engine: "local" };
  const blob = [state.need, state.features, state.notes, state.role].join(" ");
  const reco = recommend(blob, state.track);
  const question = nextQuestion(state);
  const pricePrefix = isPurePricing(latest) ? `${COPY[state.lang].price}\n\n` : "";
  if (!question) return { content: pricePrefix + summary(state, reco), lang: state.lang, engine: "local" };
  return { content: pricePrefix + question, lang: state.lang, engine: "local" };
}
