import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
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
        background: "#000000",
      },
    },
  },
  plugins: [],
};
export default config;

