import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        obsidian: "#0f1011",
        abyss: "#090a0b",
        graphite: "#2e2e2e",
        steel: "#3f4041",
        silver: "#cacaca",
        "iris-gleam": "#847dff",
        "cyan-signal": "#00b3dd",
        "pale-iris": "#d1c9ff",
        "deep-iris": "#4b49aa",
        "orchid-bloom": "#dd90d8",
        periwinkle: "#90b8f0",
        fog: "#6a6b6b",
        ash: "#9f9fa0",
        cloud: "#f5f5f7",
        pure: "#ffffff",
        void: "#000000",
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          900: "#1e3a8a",
        },
      },
      fontFamily: {
        serif: ["var(--font-lyon-display)", "Georgia", "serif"],
        display: ["var(--font-lyon-display)", "Georgia", "serif"],
        sans: ["var(--font-suisse-intl)", "Inter", "sans-serif"],
        body: ["var(--font-suisse-intl)", "Inter", "sans-serif"],
        mono: ["var(--font-roboto-mono)", "Roboto Mono", "monospace"],
      },
      borderRadius: {
        "origin-card": "16px",
        "origin-feature": "30px",
        "origin-input": "8px",
        "origin-btn": "8px",
        "origin-pill": "9999px",
      },
    },
  },
  plugins: [],
};

export default config;
