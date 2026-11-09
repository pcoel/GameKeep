import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#090d16",
        surface: {
          DEFAULT: "#111726",
          muted: "#182135",
          border: "#24314c",
        },
        primary: {
          DEFAULT: "#8b5cf6",
          hover: "#7c3aed",
          foreground: "#ffffff",
        },
        accent: {
          cyan: "#06b6d4",
          emerald: "#10b981",
          rose: "#f43f5e",
        },
        gamekeep: {
          dark: "#060911",
          card: "#0f1523",
          border: "#1f293d",
          text: "#f1f5f9",
          muted: "#94a3b8",
        },
      },
    },
  },
  plugins: [],
};

export default config;

