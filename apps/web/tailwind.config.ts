import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist)", "var(--font-noto-jp)", "system-ui", "sans-serif"],
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        brand: {
          DEFAULT: "#4e90d8",
          strong: "#3f7fc6",
          ink: "#142a44",
          bg: "#edf8ff",
          "bg-soft": "#f7fbff",
          line: "#d8e8f7",
          muted: "#5f7694",
        },
      },
    },
  },
  plugins: [],
};

export default config;
