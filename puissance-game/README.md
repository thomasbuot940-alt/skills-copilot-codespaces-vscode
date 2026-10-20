# Puissance Game

Magasin de jeux vidéo cyberpunk — vitrine portfolio multi-pages (React + Vite + TypeScript).

## Lancer en local

```bash
cd puissance-game
npm install
npm run dev
```

Ouvrir l’URL affichée (souvent `http://localhost:5173`).

Build production :

```bash
npm run build
npm run preview
```

## Pages

| Route | Contenu |
|-------|---------|
| `/` | Accueil — hero marque **Puissance Game** |
| `/catalogue` | Catalogue filtrable |
| `/produit/:slug` | Fiche produit |
| `/panier` | Panier / wishlist démo |
| `/a-propos` | Portfolio / contact |

## Musique

Ambiance **générative Web Audio** (`src/audio/cyberAmbient.ts`) — drones, arpèges et textures noise originales. Aucun sample copyrighté (pas de Cyberpunk 2077 ni autre titre protégé). Bouton **Ambiance** en bas à gauche (gesture utilisateur requis par les navigateurs).

## Stack

- React 19 + React Router 7
- Vite 7 + TypeScript
- CSS custom properties + canvas (pluie binaire) + chatbot PULSE
