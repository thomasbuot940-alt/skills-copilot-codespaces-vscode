export type Product = {
  id: string
  slug: string
  title: string
  titleJa: string
  tagline: string
  price: number
  genre: string
  tags: string[]
  rating: number
  year: number
  description: string
  features: string[]
  accent: string
  pattern: 'grid' | 'circuit' | 'pulse' | 'scan' | 'orbit'
}

export const products: Product[] = [
  {
    id: 'pg-01',
    slug: 'neon-protocol',
    title: 'Neon Protocol',
    titleJa: 'ネオン・プロトコル',
    tagline: 'Infiltrez le réseau avant qu’il ne vous absorbe.',
    price: 4980,
    genre: 'Infiltration',
    tags: ['solo', 'stealth', 'cyber'],
    rating: 4.8,
    year: 2026,
    description:
      'Un thriller d’infiltration dans les gratte-ciel de Neo-Osaka. Piratez, disparaisez, et choisissez qui survit dans le protocole.',
    features: ['Campagne narrative 18h', 'Modes stealth / run', 'Soundtrack générative'],
    accent: '#00E5FF',
    pattern: 'circuit',
  },
  {
    id: 'pg-02',
    slug: 'binary-ronin',
    title: 'Binary Ronin',
    titleJa: 'バイナリ・浪人',
    tagline: 'Un sabre de lumière. Zéro pitié pour le code mort.',
    price: 3980,
    genre: 'Action',
    tags: ['combat', 'arcade', 'jp'],
    rating: 4.6,
    year: 2025,
    description:
      'Combats rythmés où chaque combo écrit une ligne de machine code. Parfait pour les sessions courtes entre deux sprints.',
    features: ['Boss rush', 'Combo editor', 'Classements hebdo'],
    accent: '#C8FF3C',
    pattern: 'grid',
  },
  {
    id: 'pg-03',
    slug: 'signal-drift',
    title: 'Signal Drift',
    titleJa: 'シグナル・ドリフト',
    tagline: 'Course illégale sur les autoroutes de données.',
    price: 4480,
    genre: 'Racing',
    tags: ['multi', 'vitesse', 'neon'],
    rating: 4.7,
    year: 2026,
    description:
      'Glissez entre les paquets perdus. Tuning, drifts et courses en temps réel avec des fantômes de pilotes du monde entier.',
    features: ['8 circuits', 'Ghost racing', 'Tuning modular'],
    accent: '#FF9F1C',
    pattern: 'pulse',
  },
  {
    id: 'pg-04',
    slug: 'ghost-kernel',
    title: 'Ghost Kernel',
    titleJa: 'ゴースト・カーネル',
    tagline: 'Survivez dans le noyau hanté du mainframe.',
    price: 5480,
    genre: 'Horror',
    tags: ['horreur', 'énigmes', 'solo'],
    rating: 4.9,
    year: 2024,
    description:
      'Exploration psychologique dans un OS qui rêve. Les logs mentent. Les processus vous regardent.',
    features: ['Audio binaural', 'Fins multiples', 'Mode photo glitch'],
    accent: '#FF4D6D',
    pattern: 'scan',
  },
  {
    id: 'pg-05',
    slug: 'orbit-syndicate',
    title: 'Orbit Syndicate',
    titleJa: 'オービット・シンジケート',
    tagline: 'Construisez votre empire orbital — ou volez-en un.',
    price: 5980,
    genre: 'Strategy',
    tags: ['stratégie', 'coop', 'empire'],
    rating: 4.5,
    year: 2025,
    description:
      'Gestion spatiale tendue pour équipes. Idéal pour workshops startup : négociation, risque, pivot.',
    features: ['Coop 4 joueurs', 'Scénarios business', 'Export de stats'],
    accent: '#7CF5FF',
    pattern: 'orbit',
  },
  {
    id: 'pg-06',
    slug: 'pixel-tsunami',
    title: 'Pixel Tsunami',
    titleJa: 'ピクセル・津波',
    tagline: 'Un shoot ’em up rétro qui noie l’écran de motifs.',
    price: 2480,
    genre: 'Shooter',
    tags: ['rétro', 'score', 'arcade'],
    rating: 4.4,
    year: 2023,
    description:
      'Bullet hell coloré, bornes virtuelles, et scoreboard local pour les game nights d’équipe.',
    features: ['Local co-op', 'Stages endless', 'Skins studio'],
    accent: '#B8FF66',
    pattern: 'grid',
  },
]

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug)
}

export function formatYen(price: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    maximumFractionDigits: 0,
  }).format(price)
}
