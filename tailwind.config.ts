import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"]
      },
      borderRadius: {
        lg: "1rem",
        xl: "1.25rem",
        "2xl": "1.5rem"
      },
      boxShadow: {
        comic: "10px 10px 0px rgba(0,0,0,0.95)"
      },
      colors: {
        brand: "#FF4500",
        brandSoft: "#FF45001A", // ~10% opacity
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
}

export default config
