import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#050508",
        metal: "#11131a",
        matrix: "#00ff9d",
        cyan: "#00f3ff",
        magenta: "#ff0055",
        ink: "#c7d0d8",
        mute: "#8b97a8",
      },
      fontFamily: {
        mono: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
        sans: ["var(--font-grotesk)", "var(--font-inter)", "system-ui", "sans-serif"],
        body: ["var(--font-inter)", "var(--font-grotesk)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        neon: "0 0 24px rgba(0, 243, 255, 0.25), inset 0 0 0 1px rgba(0, 255, 157, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
