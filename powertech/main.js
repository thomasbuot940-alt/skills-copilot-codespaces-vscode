/* PowerTech
   Branche le canal mail en remplaçant la chaîne vide par ton adresse.
   Tant qu'elle est vide, le brief est copié et affiché, jamais envoyé. */
const CONTACT_EMAIL = "thomasbuot940@gmail.com";

const root = document.documentElement;
const world = document.getElementById("world");
const wave = document.getElementById("wave");
const worldCtx = world.getContext("2d", { alpha: true });
const waveCtx = wave.getContext("2d", { alpha: true });

const chargeEl = document.getElementById("charge");
const statCharge = document.getElementById("stat-charge");
const statCols = document.getElementById("stat-cols");
const statFps = document.getElementById("stat-fps");
const statQuality = document.getElementById("stat-quality");
const pulse = document.getElementById("pulse");
const segments = document.getElementById("segments");
const regime = document.getElementById("regime");
const regimeValue = document.getElementById("regime-value");
const surgeBtn = document.getElementById("surge");
const calmBtn = document.getElementById("calm");
const soundBtn = document.getElementById("sound");
const cursorRing = document.getElementById("cursor-ring");
const reactor = document.getElementById("reactor");
const orbitA = document.getElementById("orbit-a");
const orbitB = document.getElementById("orbit-b");
const marquee = document.getElementById("marquee");
const canal = document.getElementById("canal");

const GLYPH = ["0", "1"];
const FONT = "500 13px 'IBM Plex Mono', ui-monospace, monospace";
const PHRASE =
  "01010000 01011001 01010100 01001000 01001111 01001110    ·    IA GÉNÉRATIVE    ·    PYTHON    ·    SITES WEB    ·    POWERTECH    ·    ";

let columns = [];
let particles = [];
let slices = [];
let cssPower = -1;
let scrollPower = 0;
let manualPower = 0;
let surgePower = 0;
let surgeUntil = 0;
let quality = 1;
let lastGap = 0;
let bits = "010010000100111101010111";
let pointerX = window.innerWidth * 0.72;
let pointerY = window.innerHeight * 0.42;
let ringX = pointerX;
let ringY = pointerY;
let reactorCenter = { x: pointerX, y: pointerY };
let angle = 0;
let marqueeOffset = 0;
let lastBit = 0;
let lastHud = 0;
let lastCenter = 0;
let fps = 60;
let frames = 0;
let fpsStamp = 0;
let running = true;
let audio = null;
let soundOn = false;
let nextBlip = 0;
let finePointer = window.matchMedia("(pointer: fine)").matches;

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function calmOn() {
  return root.classList.contains("is-calm");
}

function livePower() {
  if (calmOn()) return 0;
  return clamp(Math.max(scrollPower, manualPower, surgePower), 0, 1);
}

function safeMail(address) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address) ? address : "";
}

function boot() {
  const site = document.getElementById("site");
  if (!root.classList.contains("is-booting")) {
    site.removeAttribute("inert");
    return;
  }
  site.setAttribute("inert", "");
  const skip = document.getElementById("skip-boot");
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    root.classList.remove("is-booting");
    site.removeAttribute("inert");
    try {
      sessionStorage.setItem("pt-boot", "1");
    } catch (err) {
      /* sessionStorage peut être bloqué : le site reste utilisable. */
    }
  };
  skip.addEventListener("click", finish);
  window.setTimeout(finish, 2600);
}

function resizeContext(canvas, ctx, fallbackW, fallbackH) {
  const dpr = Math.min(window.devicePixelRatio || 1, 1.35);
  const w = canvas.clientWidth || fallbackW;
  const h = canvas.clientHeight || fallbackH;
  canvas.width = Math.max(1, Math.floor(w * dpr));
  canvas.height = Math.max(1, Math.floor(h * dpr));
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { w, h };
}

function buildColumns(w, gap) {
  const count = clamp(Math.round(w / gap), 8, 58);
  const used = w / count;
  const next = [];
  for (let i = 0; i < count; i += 1) {
    const prev = columns[i];
    next.push({
      i,
      x: i * used,
      y: prev ? prev.y : Math.random() * window.innerHeight,
      speed: 50 + Math.random() * 110,
    });
  }
  columns = next;
  lastGap = gap;
}

function paintVoid(ctx, canvas) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "#05060a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
}

function spawn(x, y, power) {
  if (particles.length > 56) particles.shift();
  const a = Math.random() * Math.PI * 2;
  const s = 16 + Math.random() * (30 + power * 110);
  particles.push({
    x,
    y,
    vx: Math.cos(a) * s,
    vy: Math.sin(a) * s - 10,
    life: 1,
    g: GLYPH[(Math.random() * 2) | 0],
  });
}

function drawGrid(ctx, w, h, time, power) {
  const horizon = h * 0.58;
  const vpX = w * (0.5 + (pointerX / w - 0.5) * 0.12);
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, horizon, w, h - horizon);
  ctx.clip();
  ctx.lineWidth = 1;
  ctx.strokeStyle = `rgba(109, 255, 224, ${0.12 + power * 0.38})`;
  const cols = 16;
  for (let i = 0; i <= cols; i += 1) {
    ctx.beginPath();
    ctx.moveTo(vpX, horizon);
    ctx.lineTo((i / cols) * w, h);
    ctx.stroke();
  }
  const rows = 11;
  const shift = (time * (0.12 + power * 0.85)) % 1;
  for (let r = 0; r < rows; r += 1) {
    const p = ((r + shift) / rows) ** 1.7;
    const y = horizon + p * (h - horizon);
    ctx.globalAlpha = 0.2 + p * 0.8;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}

function drawWorld(now, dt, power) {
  const size = resizeCached.world;
  const w = size.w;
  const h = size.h;
  const ctx = worldCtx;
  const fade = calmOn() ? 1 : 0.22 + (1 - power) * 0.08;
  ctx.fillStyle = `rgba(5, 6, 10, ${fade})`;
  ctx.fillRect(0, 0, w, h);
  if (calmOn()) return;

  const gap = clamp(15 + (1 - quality) * 16 - power * 3, 12, 34);
  if (Math.abs(gap - lastGap) > 1.4 || columns.length === 0) buildColumns(w, gap);

  ctx.font = FONT;
  ctx.textBaseline = "top";

  for (let i = 0; i < columns.length; i += 1) {
    const col = columns[i];
    const near = 1 - clamp(Math.abs(col.x - pointerX) / 160, 0, 1);
    const boost = 1 + near * 1.35 + power * 1.7;
    col.y += col.speed * boost * dt;
    if (col.y > h + 24) {
      col.y = -40 - Math.random() * 220;
      col.speed = 40 + Math.random() * (70 + power * 160);
    }
    const tail = Math.max(3, Math.round((4 + power * 6) * quality));
    const hot = power > 0.58 && col.i % 8 === 0;
    for (let t = tail; t >= 0; t -= 1) {
      const glyph = GLYPH[(col.i + t + ((col.y / 16) | 0)) & 1];
      const y = col.y - t * (14 + power * 2);
      if (t === 0) {
        ctx.globalAlpha = 0.92;
        ctx.fillStyle = near > 0.65 ? "#ffffff" : "#f3fffb";
      } else {
        ctx.globalAlpha = (1 - t / (tail + 1)) * (0.28 + power * 0.55);
        ctx.fillStyle = hot ? "#ff4d6d" : "#6dffe0";
      }
      ctx.fillText(glyph, col.x, y);
    }
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = "rgba(5, 6, 10, 0.42)";
  ctx.fillRect(0, h * 0.58, w, h * 0.42);
  drawGrid(ctx, w, h, now / 1000, power);

  for (let s = slices.length - 1; s >= 0; s -= 1) {
    const slice = slices[s];
    slice.life -= dt;
    if (slice.life <= 0) {
      slices.splice(s, 1);
      continue;
    }
    ctx.globalAlpha = slice.life * 0.45;
    ctx.fillStyle = slice.color;
    ctx.fillRect(0, slice.y, w, slice.h);
  }
  ctx.globalAlpha = 1;
  if (power > 0.4 && slices.length < 5 && Math.random() < dt * power * 2.4) {
    slices.push({
      y: Math.random() * h,
      h: 2 + Math.random() * (4 + power * 10),
      life: 0.12 + Math.random() * 0.18,
      color: Math.random() > 0.5 ? "#ff4d6d" : "#8eb6ff",
    });
  }

  if (power > 0.62 && Math.random() < dt * (2 + power * 8)) {
    spawn(
      reactorCenter.x + (Math.random() - 0.5) * 36,
      reactorCenter.y + (Math.random() - 0.5) * 36,
      power
    );
  }
  for (let p = particles.length - 1; p >= 0; p -= 1) {
    const bit = particles[p];
    bit.life -= dt * 0.65;
    if (bit.life <= 0) {
      particles.splice(p, 1);
      continue;
    }
    bit.x += bit.vx * dt;
    bit.y += bit.vy * dt;
    ctx.globalAlpha = Math.max(0, bit.life);
    ctx.fillStyle = bit.g === "1" ? "#6dffe0" : "#ffc14d";
    ctx.fillText(bit.g, bit.x, bit.y);
  }
  ctx.globalAlpha = 1;
}

function drawWave(now, power) {
  const size = resizeCached.wave;
  const ctx = waveCtx;
  const w = size.w;
  const h = size.h;
  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = calmOn() ? "rgba(109, 255, 224, 0.35)" : `rgba(109, 255, 224, ${0.45 + power * 0.5})`;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  const step = 18;
  const moving = !calmOn();
  const speed = moving ? 30 + power * 220 : 0;
  const shift = ((now / 1000) * speed) % step;
  const clock = moving ? now * (0.02 + power * 0.12) : 0;
  let prevY = null;
  for (let x = 0; x <= w; x += step) {
    const bit = Math.floor((x + clock) / step) & 1;
    const y = bit ? 28 : h - 28;
    const px = x - shift;
    if (prevY === null) ctx.moveTo(px, y);
    else {
      ctx.lineTo(px, prevY);
      ctx.lineTo(px, y);
    }
    prevY = y;
  }
  ctx.stroke();
  ctx.font = "12px monospace";
  ctx.fillStyle = "rgba(255, 193, 77, 0.85)";
  const label = bits.slice(0, 16);
  ctx.fillText(label, 12, 20);
}

const resizeCached = {
  world: { w: 1, h: 1 },
  wave: { w: 1, h: 1 },
};

function resizeAll() {
  if (!worldCtx || !waveCtx) return;
  resizeCached.world = resizeContext(world, worldCtx, window.innerWidth, window.innerHeight);
  resizeCached.wave = resizeContext(wave, waveCtx, 640, 140);
  lastGap = 0;
}

function measureScroll() {
  const max = root.scrollHeight - root.clientHeight;
  scrollPower = max <= 0 ? 0 : root.scrollTop / max;
}

function updateHud(now, power) {
  const pct = Math.round(power * 100);
  const label = String(pct).padStart(2, "0");
  chargeEl.textContent = label;
  statCharge.textContent = label;
  statCols.textContent = calmOn() ? "00" : String(columns.length).padStart(2, "0");
  statFps.textContent = calmOn() ? "—" : String(Math.round(fps)).padStart(2, "0");
  statQuality.textContent = quality > 0.85 ? "Pleine" : "Adaptée";
  const lit = Math.round(power * 10);
  const bars = segments.children;
  for (let i = 0; i < bars.length; i += 1) {
    bars[i].classList.toggle("on", i < lit);
  }
  const q = Math.round(power * 20) / 20;
  if (q !== cssPower) {
    cssPower = q;
    root.style.setProperty("--power", q.toFixed(2));
  }
  root.classList.toggle("is-surge", surgePower > 0.72);
  surgeBtn.setAttribute("aria-pressed", surgePower > 0.2 ? "true" : "false");
  if (now - lastBit > 140 - power * 90) {
    lastBit = now;
    if (!calmOn()) {
      bits = bits.slice(1) + GLYPH[(Math.random() * 2) | 0];
      pulse.textContent = bits;
    }
  }
}

function tickAudio(now, power) {
  if (!soundOn || !audio) return;
  const interval = 760 - power * 560;
  if (now < nextBlip) return;
  nextBlip = now + interval;
  const osc = audio.ctx.createOscillator();
  const gain = audio.ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = Math.random() > 0.5 ? 740 : 420;
  gain.gain.value = 0.03;
  osc.connect(gain);
  gain.connect(audio.master);
  const t = audio.ctx.currentTime;
  osc.start(t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
  osc.stop(t + 0.07);
}

function frame(now) {
  if (!running) return;
  const dt = Math.min(0.034, (now - frame.last) / 1000 || 0.016);
  frame.last = now;
  measureScroll();
  const targetSurge = now < surgeUntil ? (surgeUntil - now > 800 ? 1 : (surgeUntil - now) / 800) : 0;
  surgePower += (targetSurge - surgePower) * 0.12;
  const power = livePower();

  frames += 1;
  if (now - fpsStamp > 500) {
    fps = (frames * 1000) / (now - fpsStamp);
    frames = 0;
    fpsStamp = now;
    if (!calmOn()) {
      if (fps < 46) quality = clamp(quality - 0.08, 0.45, 1);
      else if (fps > 57) quality = clamp(quality + 0.04, 0.45, 1);
    }
  }

  if (worldCtx) drawWorld(now, dt, power);
  if (waveCtx) drawWave(now, power);

  if (!calmOn()) {
    angle += dt * (0.35 + power * 2.4);
    orbitA.style.transform = `rotate(${angle}rad)`;
    orbitB.style.transform = `rotate(${-angle * 0.72}rad)`;
  }

  if (!calmOn() && finePointer) {
    ringX += (pointerX - ringX) * 0.18;
    ringY += (pointerY - ringY) * 0.18;
    cursorRing.style.transform = `translate(${ringX}px, ${ringY}px)`;
    const rx = (pointerX / Math.max(1, resizeCached.world.w) - 0.5) * 14;
    const ry = (pointerY / Math.max(1, resizeCached.world.h) - 0.5) * 10;
    reactor.style.transform = `translate(${rx}px, ${ry}px)`;
  }

  if (marquee.scrollWidth > 0) {
    const half = marquee.scrollWidth / 2;
    const speed = calmOn() ? 0 : 46 + power * 170;
    marqueeOffset = (marqueeOffset + dt * speed) % half;
    marquee.style.transform = `translate3d(${-marqueeOffset}px, 0, 0)`;
  }

  if (now - lastCenter > 240) {
    lastCenter = now;
    const box = reactor.getBoundingClientRect();
    reactorCenter = { x: box.left + box.width / 2, y: box.top + box.height / 2 };
  }

  if (now - lastHud > 80) {
    lastHud = now;
    updateHud(now, power);
  }
  tickAudio(now, power);
  requestAnimationFrame(frame);
}
frame.last = 0;

function setupMarquee() {
  let chunk = PHRASE;
  while (chunk.length < 420) chunk += PHRASE;
  marquee.textContent = chunk + chunk;
}

function setupSegments() {
  for (let i = 0; i < 10; i += 1) {
    const bar = document.createElement("i");
    segments.appendChild(bar);
  }
}

function setCalm(on) {
  root.classList.toggle("is-calm", on);
  calmBtn.setAttribute("aria-pressed", on ? "true" : "false");
  surgeBtn.disabled = on;
  if (on) {
    particles = [];
    slices = [];
    surgePower = 0;
    surgeUntil = 0;
    reactor.style.transform = "none";
  }
}

function ensureAudio() {
  if (audio) return true;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return false;
  const ctx = new Ctx();
  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);
  const low = ctx.createOscillator();
  const high = ctx.createOscillator();
  low.type = "sine";
  high.type = "triangle";
  low.frequency.value = 46;
  high.frequency.value = 92.4;
  const mix = ctx.createGain();
  mix.gain.value = 0.2;
  low.connect(mix);
  high.connect(mix);
  mix.connect(master);
  low.start();
  high.start();
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 1400;
  const noiseGain = ctx.createGain();
  noiseGain.gain.value = 0.012;
  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(master);
  noise.start();
  audio = { ctx, master };
  return true;
}

function setSound(on) {
  if (on && !ensureAudio()) {
    soundBtn.setAttribute("aria-pressed", "false");
    return;
  }
  soundOn = on;
  soundBtn.setAttribute("aria-pressed", on ? "true" : "false");
  if (!audio) return;
  audio.ctx.resume();
  const t = audio.ctx.currentTime;
  audio.master.gain.cancelScheduledValues(t);
  audio.master.gain.linearRampToValueAtTime(on ? 0.32 : 0, t + 0.18);
}

function bindUi() {
  calmBtn.addEventListener("click", () => setCalm(!calmOn()));
  soundBtn.addEventListener("click", () => setSound(!soundOn));
  surgeBtn.addEventListener("click", () => {
    if (calmOn()) return;
    surgeUntil = performance.now() + 4200;
  });
  regime.addEventListener("input", () => {
    manualPower = Number(regime.value) / 100;
    regimeValue.textContent = regime.value;
    regime.style.setProperty("--val", `${regime.value}%`);
  });
  regime.style.setProperty("--val", "0%");

  if (finePointer) root.classList.add("has-cursor");
  window.addEventListener("pointermove", (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    if (!calmOn() && livePower() > 0.25 && Math.random() < 0.35) {
      spawn(event.clientX, event.clientY, livePower());
    }
  });

  const menu = document.getElementById("menu");
  const panel = document.getElementById("nav-panel");
  const closeMenu = () => {
    panel.classList.remove("is-open");
    menu.setAttribute("aria-expanded", "false");
  };
  menu.addEventListener("click", () => {
    const open = panel.classList.toggle("is-open");
    menu.setAttribute("aria-expanded", open ? "true" : "false");
  });
  panel.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("click", (event) => {
    if (!panel.classList.contains("is-open")) return;
    if (panel.contains(event.target) || menu.contains(event.target)) return;
    closeMenu();
  });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth >= 960) closeMenu();
    resizeAll();
  });

  const links = [...panel.querySelectorAll("a[href^='#']")];
  const watched = ["offres", "protocole", "chambre", "brief"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  if ("IntersectionObserver" in window) {
    const visible = new Set();
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        });
        const current = ["offres", "protocole", "chambre", "brief"].filter((id) => visible.has(id)).pop();
        links.forEach((link) => {
          link.classList.toggle("is-current", Boolean(current) && link.getAttribute("href") === `#${current}`);
        });
      },
      { rootMargin: "-35% 0px -45% 0px", threshold: 0.01 }
    );
    watched.forEach((section) => spy.observe(section));
  }

  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;
    if (running) {
      frame.last = performance.now();
      requestAnimationFrame(frame);
    }
    if (document.hidden && soundOn) setSound(false);
  });
}

function setFieldError(inputId, errorId, message) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  error.textContent = message;
  input.setAttribute("aria-invalid", message ? "true" : "false");
  if (message) input.setAttribute("aria-describedby", errorId);
  else input.removeAttribute("aria-describedby");
}

function bindForm() {
  const mail = safeMail(CONTACT_EMAIL.trim());
  if (mail) canal.textContent = "Canal · messagerie";

  const form = document.getElementById("brief-form");
  const result = document.getElementById("result");
  const status = document.getElementById("result-status");
  const output = document.getElementById("brief-out");
  const alert = document.getElementById("form-alert");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = {
      name: document.getElementById("nom").value.trim(),
      email: document.getElementById("email").value.trim(),
      mission: document.getElementById("mission").value.trim(),
      message: document.getElementById("message").value.trim(),
      trap: document.getElementById("societe").value.trim(),
    };
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);
    setFieldError("nom", "err-nom", data.name.length < 2 ? "Indique au moins deux caractères." : "");
    setFieldError("email", "err-email", emailOk ? "" : "Indique un email valide.");
    setFieldError("mission", "err-mission", data.mission ? "" : "Choisis le site que tu veux.");
    setFieldError(
      "message",
      "err-message",
      data.message.length < 12 ? "Quelques phrases suffisent — douze caractères minimum." : ""
    );
    const invalid = form.querySelector("[aria-invalid='true']");
    if (invalid) {
      alert.textContent = "Le signal est incomplet.";
      invalid.focus();
      return;
    }
    alert.textContent = "";
    if (data.trap) {
      status.textContent = "Signal reçu.";
      output.textContent = "";
      form.hidden = true;
      result.hidden = false;
      status.focus();
      return;
    }
    const brief = [
      "POWERTECH — BRIEF",
      `Nom : ${data.name}`,
      `Email : ${data.email}`,
      `Mission : ${data.mission}`,
      "",
      data.message,
    ].join("\n");
    let copied = false;
    try {
      await navigator.clipboard.writeText(brief);
      copied = true;
    } catch (err) {
      copied = false;
    }
    output.textContent = brief;
    if (mail) {
      status.textContent = copied
        ? "Brief copié. La messagerie s’ouvre."
        : "Brief prêt. La messagerie s’ouvre.";
      const href = `mailto:${mail}?subject=${encodeURIComponent(`Brief PowerTech — ${data.mission}`)}&body=${encodeURIComponent(brief)}`;
      window.location.href = href;
    } else if (copied) {
      status.textContent = "Brief copié. Envoie-le à Thomas : il est prêt dans le presse-papiers.";
    } else {
      status.textContent = "Brief prêt. Sélectionne le texte ci-dessous pour l’envoyer à Thomas.";
    }
    form.hidden = true;
    result.hidden = false;
    status.focus();
  });

  document.getElementById("reset-brief").addEventListener("click", () => {
    form.reset();
    ["nom", "email", "mission", "message"].forEach((id) => {
      document.getElementById(id).setAttribute("aria-invalid", "false");
    });
    ["err-nom", "err-email", "err-mission", "err-message"].forEach((id) => {
      document.getElementById(id).textContent = "";
    });
    alert.textContent = "";
    result.hidden = true;
    form.hidden = false;
    document.getElementById("nom").focus();
  });
}

setupMarquee();
setupSegments();
bindForm();
if (worldCtx && waveCtx) {
  resizeAll();
  setCalm(calmOn());
  bindUi();
  boot();
  fpsStamp = performance.now();
  requestAnimationFrame(frame);
} else {
  document.getElementById("site").removeAttribute("inert");
  root.classList.remove("is-booting");
}
