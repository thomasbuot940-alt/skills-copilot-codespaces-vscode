import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });
const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-grotesk", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: "POWERTECH THE FUTURE",
  description:
    "PYTHON ENGINEERING // AI, 3D & WEB SYSTEMS. Thomas — développement Python, IA et web sur mesure. Missions et recrutement tech, TJM 350 €/jour, 100 % en ligne.",
};

export const viewport: Viewport = {
  themeColor: "#050508",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Powertech The Future",
  description: "Python, IA et systèmes web. Missions freelance et recrutement tech.",
  areaServed: ["FR", "Worldwide"],
  priceRange: "€€",
  founder: { "@type": "Person", name: "Thomas" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${jetbrains.variable} ${grotesk.variable} ${inter.variable}`}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        {children}
      </body>
    </html>
  );
}
