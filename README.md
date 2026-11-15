# POWERTECH THE FUTURE

Site officiel du studio de Thomas : vitrine freelance, lab recruteurs, checkout carte et Angel, l'assistante IA.

Sous-titre : `PYTHON ENGINEERING // AI, 3D & WEB SYSTEMS`.

## Lancer

```bash
npm install
npm run dev
```

Puis ouvrir `http://localhost:3000`.

```bash
npm run check
npm run build
```

## Parcours

- **Terminal** — présentation et interpréteur Python sûr (expressions, variables, `print`).
- **Méthode** — texte clair sur le pilotage de l'IA générative et le contrôle humain.
- **Lab** — activité illustrative, filtres, live preview, extrait de code. Ajoutez une création dans `data/projects.ts`.
- **Offres** — Starter 149 €, Pro 397 € (ou 2x 209 €), Enterprise 797 €, maintenance 49 €/mois, TJM 350 €/jour.
- **Paiement** — carte holographique. Le numéro reste dans le navigateur. `/api/checkout` recalcule le total et, si `STRIPE_SECRET_KEY` est posée, crée un PaymentIntent. Aucune donnée de carte n'est acceptée par le serveur.
- **Angel** — s'ouvre une seconde après l'arrivée. Voix navigateur par défaut. Clés optionnelles dans `.env.example` : `GEMINI_API_KEY` (`gemini-2.5-pro`) ou `OPENAI_API_KEY` (`gpt-4o`). Sans clé, le cerveau local répond. Le mode Studio rédige un prompt Cursor copiable.

## Audio

`AudioEngine` synthétise une nappe dark-synth dans le navigateur et baisse le volume quand Angel parle ou quand le micro est ouvert. Si le contexte audio échoue, lecture de `public/cyberpunk-theme.mp3`.

```bash
npm run theme
```

régénère ce fichier.

## Angel, le portrait

`public/angel-avatar.png` est le portrait d'Angel, personnage original du studio (cheveux bleu glace, tenue sombre, halo cyan). Si le fichier manque, l'interface bascule sur un glyphe holographique.
