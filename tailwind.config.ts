import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "#000000",
        foreground: "#00ff41",
        primary: {
          DEFAULT: "#00ff41",
          foreground: "#000000",
        },
        secondary: {
          DEFAULT: "#1a1a1a",
          foreground: "#00ff41",
        },
        destructive: {
          DEFAULT: "#ff0000",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#1a1a1a",
          foreground: "#00ff41",
        },
        accent: {
          DEFAULT: "#00ff41",
          foreground: "#000000",
        },
        popover: {
          DEFAULT: "#000000",
          foreground: "#00ff41",
        },
        card: {
          DEFAULT: "#000000",
          foreground: "#00ff41",
        },
        green: {
          400: "#00ff41",
          300: "#33ff66",
          500: "#00cc33",
        },
        red: {
          400: "#ff4444",
          500: "#ff0000",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)"],
        mono: ["var(--font-mono)"],
        serif: ["var(--font-serif)"],
      },
      borderRadius: {
        lg: "0px",
        md: "0px",
        sm: "0px",
        none: "0px",
      },
      animation: {
        "matrix-fall": "matrix-fall 10s linear infinite",
        glitch: "glitch 0.3s infinite",
        "fade-in-up": "fade-in-up 0.6s ease-out",
        "loading-shimmer": "loading-shimmer 2s infinite",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
