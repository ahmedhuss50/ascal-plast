import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#1F3A5F",
          light: "#2E5E8C",
          accent: "#C0392B",
          soft: "#EAF0F6",
        },
      },
      fontFamily: {
        sans: ["var(--font-app)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
