import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./contexts/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          blue: "#031f5f",
          azure: "#00afee",
          pink: "#ca00ca",
          brown: "#c2af00",
          yellow: "#ccff00",
        },
        background: {
          DEFAULT: "var(--background)",
          light: "#ffffff",
          dark: "#000000",
        },
        foreground: {
          DEFAULT: "var(--foreground)",
          light: "#1a1a1a",
          dark: "#ffffff",
        },
        card: {
          bg: "var(--card-bg)",
          border: "var(--card-border)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
        },
        border: {
          DEFAULT: "var(--border-color)",
        },
        hover: {
          DEFAULT: "var(--hover-bg)",
        },
        input: {
          bg: "var(--input-bg)",
          border: "var(--input-border)",
        },
      },
    },
  },
  plugins: [],
};
export default config;










