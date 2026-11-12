"use strict";

const CONTACT_EMAIL = "thomasbuot940@gmail.com";

function setupRain() {
  const canvas = document.getElementById("binaire");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const font = "500 14px 'IBM Plex Mono', ui-monospace, monospace";
  const size = 16;
  let columns = [];
  let width = 0;
  let height = 0;
  let raf = 0;
  let last = 0;
  let pointerX = -9999;

  function layout() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.max(1, Math.ceil(width / size));
    columns = Array.from({ length: count }, function (_, index) {
      return {
        x: index * size,
        y: Math.random() * height,
        speed: 28 + Math.random() * 70,
        head: Math.random() < 0.5 ? "0" : "1"
      };
    });
  }

  function glyph() {
    return Math.random() < 0.5 ? "0" : "1";
  }

  function drawStatic() {
    ctx.clearRect(0, 0, width, height);
    ctx.font = font;
    ctx.fillStyle = "rgba(109, 255, 224, 0.16)";
    for (let y = size; y < height; y += size * 2) {
      for (let x = 0; x < width; x += size * 2) {
        ctx.fillText((x / size + y / size) % 2 === 0 ? "0" : "1", x, y);
      }
    }
  }

  function frame(now) {
    const dt = Math.min(0.034, (now - last) / 1000 || 0.016);
    last = now;
    ctx.fillStyle = "rgba(5, 6, 10, 0.18)";
    ctx.fillRect(0, 0, width, height);
    ctx.font = font;
    columns.forEach(function (column) {
      const near = Math.abs(column.x - pointerX) < 70;
      column.y += column.speed * dt * (near ? 2.4 : 1);
      if (column.y > height + size) {
        column.y = -size;
        column.head = glyph();
      }
      if (Math.random() < 0.04) column.head = glyph();
      ctx.fillStyle = near ? "rgba(255, 193, 77, 0.9)" : "rgba(109, 255, 224, 0.85)";
      ctx.fillText(column.head, column.x, column.y);
      ctx.fillStyle = "rgba(109, 255, 224, 0.28)";
      ctx.fillText(column.head === "0" ? "1" : "0", column.x, column.y - size);
    });
    raf = window.requestAnimationFrame(frame);
  }

  function start() {
    window.cancelAnimationFrame(raf);
    if (reduce.matches) {
      drawStatic();
      return;
    }
    if (document.hidden) return;
    last = performance.now();
    raf = window.requestAnimationFrame(frame);
  }

  layout();
  start();
  window.addEventListener("resize", function () {
    layout();
    start();
  });
  window.addEventListener("pointermove", function (event) {
    pointerX = event.clientX;
  }, { passive: true });
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      window.cancelAnimationFrame(raf);
      return;
    }
    start();
  });
  reduce.addEventListener("change", start);
}

function euros(value) {
  let clean = value.trim().replace(/\s/g, "");
  if (clean.indexOf(",") !== -1) clean = clean.replace(/\./g, "").replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(clean)) return null;
  const amount = Number(clean);
  if (!Number.isFinite(amount) || amount <= 0 || amount > 1000000) return null;
  return amount;
}

function formatEuros(amount) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount);
}

function dayStamp() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return String(now.getFullYear()) + month + day;
}

function referenceFor(project) {
  const slug = project
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "")
    .slice(0, 8)
    .toUpperCase() || "SITE";
  const salt = Math.random().toString(36).slice(2, 6).toUpperCase();
  return "PT-" + dayStamp() + "-" + slug + "-" + salt;
}

function bindField(input, message) {
  const slot = document.getElementById(input.id + "-error");
  if (!slot) return;
  if (message) {
    input.setAttribute("aria-invalid", "true");
    input.setAttribute("aria-describedby", slot.id);
    slot.textContent = message;
    return;
  }
  input.removeAttribute("aria-invalid");
  input.removeAttribute("aria-describedby");
  slot.textContent = "";
}

function copyText(text, note) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function () {
      note.textContent = "Copié.";
    }).catch(function () {
      note.textContent = "Le texte est affiché juste au-dessus. Copie-le à la main.";
    });
    return;
  }
  note.textContent = "Le texte est affiché juste au-dessus. Copie-le à la main.";
}

function setupLead() {
  const form = document.getElementById("lead-form");
  const note = document.getElementById("lead-note");
  const copy = document.getElementById("lead-copy");
  const preview = document.getElementById("lead-preview");
  if (!form || !note || !copy || !preview) return;

  function brief() {
    const nom = document.getElementById("nom");
    const email = document.getElementById("email");
    const projet = document.getElementById("projet");
    return [
      "Demande PowerTech",
      "Nom : " + nom.value.trim(),
      "E-mail : " + email.value.trim(),
      "Site : " + projet.value.trim()
    ].join("\n");
  }

  function validate() {
    const nom = document.getElementById("nom");
    const email = document.getElementById("email");
    const projet = document.getElementById("projet");
    let first = null;
    const nomOk = nom.value.trim().length >= 2;
    bindField(nom, nomOk ? "" : "Indique un nom.");
    if (!nomOk) first = first || nom;
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
    bindField(email, emailOk ? "" : "Indique un e-mail valide.");
    if (!emailOk) first = first || email;
    const projetOk = projet.value.trim().length >= 10;
    bindField(projet, projetOk ? "" : "Décris le site en quelques mots.");
    if (!projetOk) first = first || projet;
    return first;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const first = validate();
    if (first) {
      preview.hidden = true;
      note.textContent = "La demande est incomplète.";
      first.focus();
      return;
    }
    const body = brief();
    preview.hidden = false;
    preview.textContent = body;
    note.textContent = "Ouverture de la messagerie.";
    window.location.href = "mailto:" + CONTACT_EMAIL + "?subject=" + encodeURIComponent("Demande de site PowerTech") + "&body=" + encodeURIComponent(body);
  });

  copy.addEventListener("click", function () {
    const first = validate();
    if (first) {
      preview.hidden = true;
      note.textContent = "Complète la demande avant de la copier.";
      first.focus();
      return;
    }
    const body = brief();
    preview.hidden = false;
    preview.textContent = body;
    copyText(body, note);
  });
}

function setupPayment() {
  const form = document.getElementById("pay-form");
  const note = document.getElementById("pay-note");
  const slip = document.getElementById("pay-slip");
  const copy = document.getElementById("pay-copy");
  const send = document.getElementById("pay-send");
  if (!form || !note || !slip || !copy || !send) return;
  let order = "";
  let signature = "";

  function read() {
    const projet = document.getElementById("pay-projet");
    const montant = document.getElementById("pay-montant");
    const moyen = form.querySelector('input[name="moyen"]:checked');
    const moyenError = document.getElementById("moyen-error");
    let first = null;
    const projetOk = projet.value.trim().length >= 2;
    bindField(projet, projetOk ? "" : "Indique le nom du site livré.");
    if (!projetOk) first = first || projet;
    const amount = euros(montant.value);
    bindField(montant, amount ? "" : "Indique un montant en euros, par exemple 1500 ou 1500,50.");
    if (!amount) first = first || montant;
    if (moyenError) {
      if (moyen) {
        moyenError.textContent = "";
      } else {
        moyenError.textContent = "Choisis un moyen de paiement.";
        first = first || form.querySelector('input[name="moyen"]');
      }
    }
    if (first || !amount || !moyen) return null;
    return {
      projet: projet.value.trim(),
      amount: amount,
      moyen: moyen.value
    };
  }

  function clearOrder() {
    order = "";
    signature = "";
    slip.hidden = true;
  }

  function publish(data) {
    const next = data.projet + "|" + data.amount + "|" + data.moyen;
    if (next !== signature) {
      signature = next;
      const ref = referenceFor(data.projet);
      order = [
        "PowerTech — ordre de paiement",
        "Site : " + data.projet,
        "Montant : " + formatEuros(data.amount),
        "Moyen : " + data.moyen,
        "Référence : " + ref,
        "Destinataire : " + CONTACT_EMAIL,
        "Statut : à régler, site livré."
      ].join("\n");
      document.getElementById("pay-ref").textContent = ref;
    }
    document.getElementById("pay-amount").textContent = formatEuros(data.amount);
    document.getElementById("pay-site").textContent = data.projet;
    document.getElementById("pay-method").textContent = data.moyen;
    slip.hidden = false;
    note.textContent = "Ordre prêt. Envoie-le pour lancer le règlement.";
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const data = read();
    if (!data) {
      clearOrder();
      note.textContent = "La case de paiement est incomplète.";
      const invalid = form.querySelector("[aria-invalid='true']");
      if (invalid) invalid.focus();
      else form.querySelector('input[name="moyen"]').focus();
      return;
    }
    publish(data);
  });

  copy.addEventListener("click", function () {
    const data = read();
    if (!data) {
      clearOrder();
      note.textContent = "Prépare d’abord un ordre complet.";
      return;
    }
    publish(data);
    copyText(order, note);
  });

  send.addEventListener("click", function () {
    const data = read();
    if (!data) {
      clearOrder();
      note.textContent = "Prépare d’abord un ordre complet.";
      return;
    }
    publish(data);
    const subject = "Règlement PowerTech " + document.getElementById("pay-ref").textContent;
    window.location.href = "mailto:" + CONTACT_EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(order);
  });
}

setupRain();
setupLead();
setupPayment();
