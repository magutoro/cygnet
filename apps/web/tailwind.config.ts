import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "var(--font-noto-jp)", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          DEFAULT: "#5ba8e8",
          strong: "#3c91d8",
          ink: "#1c3551",
          bg: "#edf6ff",
          "bg-soft": "#f6fbff",
          line: "#d8e9f9",
          muted: "#5d7896",
        },
      },
    },
  },
  plugins: [],
};

export default config;
