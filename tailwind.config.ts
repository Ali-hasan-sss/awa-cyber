import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "var(--font-cairo)",
          "system-ui",
          "sans-serif",
        ],
        cairo: ["var(--font-cairo)", "sans-serif"],
        inter: ["var(--font-inter)", "sans-serif"],
      },
      colors: {
        // AWA CYBER Brand Colors from the design
        primary: {
          DEFAULT: "#FFD700", // Yellow accent
          dark: "#E6C200", // Darker yellow
          light: "#FFF44F", // Lighter yellow
          foreground: "#000000",
        },
        secondary: {
          DEFAULT: "#8B6F47", // Dark brown/mustard
          dark: "#6B5537",
          light: "#A6885F",
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#F4D03F", // Mustard yellow
          foreground: "#000000",
        },
        background: {
          DEFAULT: "#FFFFFF",
          dark: "#1A1A1A",
        },
        foreground: {
          DEFAULT: "#000000",
          muted: "#666666",
        },
        border: "#E5E5E5",
        input: "#E5E5E5",
        ring: "#FFD700",
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#000000",
        },
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#F5F5F5",
          foreground: "#666666",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};

export default config;
