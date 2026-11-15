export type ProjectCategory = "web" | "python" | "tools" | "interactive";

export type Project = {
  slug: string;
  title: string;
  category: ProjectCategory;
  year: string;
  summary: string;
  stack: string[];
  github: string | null;
  liveUrl: string | null;
  fileHint: string;
  code: { filename: string; body: string };
};

export const FILTERS: Array<{ id: "all" | ProjectCategory; label: string }> = [
  { id: "all", label: "Tous" },
  { id: "web", label: "Sites Web" },
  { id: "python", label: "Python & IA" },
  { id: "tools", label: "Outils & Automatisation" },
  { id: "interactive", label: "3D & Interactif" },
];

const REPO = "https://github.com/thomasbuot940-alt/skills-copilot-codespaces-vscode";

export const PROJECTS: Project[] = [
  {
    slug: "puissance-game",
    title: "Puissance Game",
    category: "web",
    year: "2026",
    summary: "Vitrine e-commerce cyberpunk multi-pages : catalogue, fiche, panier, ambiance sonore générative et conseiller intégré. Démo publique du studio.",
    stack: ["React", "TypeScript", "Web Audio"],
    github: REPO,
    liveUrl: "https://rainbow-flare-e78asgg.shipstatic.com",
    fileHint: "screenshots/puissance-game",
    code: {
      filename: "catalogue.tsx",
      body: `const products = catalog.filter((item) =>
  item.tags.includes(active) || active === "tous"
);

return (
  <Grid>
    {products.map((game) => (
      <Card key={game.slug} href={"/jeu/" + game.slug}>
        <Cover hue={game.hue} />
        <h2>{game.title}</h2>
        <Price value={game.price} />
      </Card>
    ))}
  </Grid>
);`,
    },
  },
  {
    slug: "powertech-os",
    title: "Powertech OS // HUD",
    category: "web",
    year: "2026",
    summary: "Ce site : navigation HUD, terminal, offres, checkout holographique et Angel. Une seule surface, écrite pour convertir et pour recruter.",
    stack: ["Next.js", "TypeScript", "Framer Motion"],
    github: REPO,
    liveUrl: null,
    fileHint: "components/SiteShell.tsx",
    code: {
      filename: "SiteShell.tsx",
      body: `export function SiteShell() {
  return (
    <SiteProvider>
      <BinaryField />
      <HudBar />
      <ViewPort />
      <AngelPanel />
    </SiteProvider>
  );
}`,
    },
  },
  {
    slug: "angel-core",
    title: "Angel Core",
    category: "python",
    year: "2026",
    summary: "Cerveau d'accueil bilingue puis multilingue : qualification client, dossier recruteur, et prompt Cursor en mode Studio. Repli local si aucune clé API n'est posée.",
    stack: ["TypeScript", "Gemini", "GPT-4o"],
    github: REPO,
    liveUrl: null,
    fileHint: "app/api/chat/route.ts",
    code: {
      filename: "route.ts",
      body: `const remote = await askModel(messages, mode, intent);
if (remote) return Response.json({ content: remote, engine });

const local = localAngelReply(messages, { mode, intent });
return Response.json({ content: local.content, engine: "local" });`,
    },
  },
  {
    slug: "pipeline-python",
    title: "Pipeline de livraison",
    category: "python",
    year: "2026",
    summary: "Trame d'un script de production : cadrer, générer, vérifier, livrer. L'extrait est celui que le terminal du site sait déjà évaluer en sous-ensemble sûr.",
    stack: ["Python", "Automatisation"],
    github: null,
    liveUrl: null,
    fileHint: "lib/terminal/python.ts",
    code: {
      filename: "pipeline.py",
      body: `tjm = 350
jours = 5
print("Mission", tjm * jours)

perimetre = "site + assistant"
print(perimetre)`,
    },
  },
  {
    slug: "audio-engine",
    title: "Moteur audio cyberpunk",
    category: "tools",
    year: "2026",
    summary: "Nappe dark-synth rendue dans le navigateur, bouclée par Web Audio, avec ducking quand Angel parle et repli sur un MP3 si le contexte audio est refusé.",
    stack: ["Web Audio", "TypeScript"],
    github: REPO,
    liveUrl: null,
    fileHint: "lib/audio/AudioEngine.ts",
    code: {
      filename: "AudioEngine.ts",
      body: `duck() {
  this.ducks += 1;
  const target = this.ducks > 0 ? 0.16 : 1;
  this.duckGain.gain.linearRampToValueAtTime(target, now + 0.28);
}`,
    },
  },
  {
    slug: "binary-field",
    title: "Champ binaire",
    category: "interactive",
    year: "2026",
    summary: "Pluie de 0 et de 1 en canvas, réactive au curseur : illumination, changement de glyphe et léger écartement. Le fond et les liserés latéraux partagent le même champ.",
    stack: ["Canvas", "WebGL-ready"],
    github: REPO,
    liveUrl: null,
    fileHint: "components/background/BinaryField.tsx",
    code: {
      filename: "BinaryField.tsx",
      body: `const near = Math.abs(col - pointerCol) < 8;
const glyph = near && Math.random() > 0.7 ? (glyph === "0" ? "1" : "0") : glyph;
ctx.fillStyle = near ? "#00f3ff" : "#00ff9d";
ctx.fillText(glyph, x + push, y);`,
    },
  },
];

export function projectBySlug(slug: string): Project | undefined {
  return PROJECTS.find((project) => project.slug === slug);
}
