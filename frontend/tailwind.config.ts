import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#080B12",
          secondary: "#101725",
          card: "#151E2D",
          dark: "#05070B",
        },
        accent: {
          primary: "#00E5FF",
          secondary: "#7C4DFF",
          hover: "#33EBFF",
        },
        cyber: {
          cyan: "#00E5FF",
          purple: "#7C4DFF",
          dark: "#080B12",
          surface: "#101725",
          card: "#151E2D",
        },
        status: {
          success: "#00D68F",
          warning: "#FFB020",
          critical: "#FF4560",
          info: "#00E5FF",
        },
        threat: {
          safe: "#00D68F",
          low: "#00B0FF",
          medium: "#FFB020",
          high: "#FF6D00",
          critical: "#FF4560",
        },
        text: {
          primary: "#F4F7FB",
          muted: "#8794A8",
          dim: "#4E5D78",
        },
      },
      keyframes: {
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "pulse-glow": {
          "0%, 100%": {
            opacity: "1",
            boxShadow: "0 0 25px rgba(0, 229, 255, 0.4), inset 0 0 15px rgba(0, 229, 255, 0.2)",
          },
          "50%": {
            opacity: "0.6",
            boxShadow: "0 0 10px rgba(0, 229, 255, 0.2), inset 0 0 5px rgba(0, 229, 255, 0.1)",
          },
        },
        "scanner-sweep": {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "50%": { opacity: "1" },
          "100%": { transform: "translateY(100%)", opacity: "0" },
        },
        "radar-spin": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        slideUp: "slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        fadeIn: "fadeIn 0.4s ease-out forwards",
        "pulse-glow": "pulse-glow 2.5s infinite ease-in-out",
        "scanner-sweep": "scanner-sweep 3s ease-in-out infinite",
        "radar-spin": "radar-spin 8s linear infinite",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
