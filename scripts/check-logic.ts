import { createEnv, runLine } from "../lib/terminal/python";
import { localAngelReply } from "../lib/angel/localBrain";
import { detectBrand, expiryOk, luhnOk } from "../lib/checkout/card";
import { computeCheckout } from "../lib/checkout/pricing";
import { ANGEL_SYSTEM_PROMPT } from "../lib/angel/systemPrompt";
import { WELCOME } from "../data/angelCopy";

let failed = 0;

function assert(condition: boolean, message: string) {
  if (!condition) {
    failed += 1;
    console.error("FAIL", message);
    return;
  }
  console.log("ok", message);
}

const env = createEnv();
assert(runLine("2 + 40", env).output === "42", "addition");
assert(runLine("x = 6", env).output === "", "assign");
assert(runLine("x * 7", env).output === "42", "variable");
assert(runLine('print("Powertech")', env).output === "Powertech", "print");
assert(runLine('"ab" * 3', env).output === '"ababab"', "string repeat");
assert(runLine("10 // 3", env).output === "3", "floor div");
assert(runLine("(2 + 3) * 4", env).output === "20", "parens");
let threw = false;
try {
  runLine("import os", env);
} catch {
  threw = true;
}
assert(threw, "import blocked");

assert(luhnOk("4242424242424242"), "luhn visa");
assert(!luhnOk("4242424242424243"), "luhn reject");
assert(detectBrand("5555555555554444") === "mastercard", "mastercard");
assert(detectBrand("378282246310005") === "amex", "amex");
assert(expiryOk("12/99", new Date("2026-01-01")), "expiry future");
assert(!expiryOk("01/20", new Date("2026-01-01")), "expiry past");

const pro = computeCheckout({ offerId: "pro", maintenance: true, payMode: "full", customAmount: null });
assert(pro.today === 446 && pro.monthly === 49 && pro.base === 397, "pro plus maintenance");
const split = computeCheckout({ offerId: "pro", maintenance: false, payMode: "split", customAmount: null });
assert(split.base === 209 && split.today === 209, "pro split");
const custom = computeCheckout({ offerId: "starter", maintenance: false, payMode: "full", customAmount: 1200 });
assert(custom.base === 1200 && custom.today === 1200, "custom amount");

assert(WELCOME.includes("Je suis Angel"), "welcome");
assert(ANGEL_SYSTEM_PROMPT.includes("Tu t'appelles Angel"), "system prompt");
assert(ANGEL_SYSTEM_PROMPT.includes("397 €"), "system prices");

const named = localAngelReply(
  [
    { role: "assistant", content: WELCOME },
    { role: "user", content: "Je m'appelle Camille" },
  ],
  { mode: "public" },
);
assert(named.lang === "fr" && named.content.includes("Camille"), "asks need with name");

const done = localAngelReply(
  [
    { role: "user", content: "Je m'appelle Camille" },
    { role: "user", content: "Un site complet avec assistant IA et paiement" },
    { role: "user", content: "compte client, pages services, paiement" },
    { role: "user", content: "trois semaines" },
    { role: "user", content: "camille@example.com" },
  ],
  { mode: "public" },
);
assert(done.content.includes("397") && done.content.includes("camille@example.com"), "french dossier recommends pro");
assert(done.content.includes("Version française pour Thomas"), "french mirror");

const english = localAngelReply(
  [
    { role: "user", content: "My name is John" },
    { role: "user", content: "I need a python scraping script" },
    { role: "user", content: "export csv" },
    { role: "user", content: "two weeks" },
    { role: "user", content: "john@example.com" },
  ],
  { mode: "public" },
);
assert(english.lang === "en" && english.content.includes("149"), "english starter");
assert(english.content.includes("Version française pour Thomas"), "english still mirrors french");

const recruit = localAngelReply(
  [
    { role: "user", content: "We are hiring" },
    { role: "user", content: "Ada" },
    { role: "user", content: "Northwind" },
    { role: "user", content: "senior python freelance" },
    { role: "user", content: "ada@northwind.io" },
  ],
  { mode: "public", intent: "recruit" },
);
assert(recruit.content.includes("350") && recruit.content.includes("ada@northwind.io"), "recruit dossier");

const studio = localAngelReply(
  [{ role: "user", content: "Landing page for a robotics startup with a quote form" }],
  { mode: "studio" },
);
assert(studio.content.includes("```cursor") && /1\./.test(studio.content), "studio prompt");

const prices = localAngelReply([{ role: "user", content: "Quels sont les prix ?" }], { mode: "public" });
assert(prices.content.includes("149") && prices.content.includes("797") && prices.content.includes("49"), "price list");

if (failed) {
  console.error(`\n${failed} failed`);
  process.exit(1);
}
console.log("\nall checks passed");
