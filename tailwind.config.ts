import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "428px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary:     { DEFAULT: "hsl(var(--primary))",     foreground: "hsl(var(--primary-foreground))" },
        secondary:   { DEFAULT: "hsl(var(--secondary))",   foreground: "hsl(var(--secondary-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        muted:       { DEFAULT: "hsl(var(--muted))",       foreground: "hsl(var(--muted-foreground))" },
        accent:      { DEFAULT: "hsl(var(--accent))",      foreground: "hsl(var(--accent-foreground))" },
        popover:     { DEFAULT: "hsl(var(--popover))",     foreground: "hsl(var(--popover-foreground))" },
        card:        { DEFAULT: "hsl(var(--card))",        foreground: "hsl(var(--card-foreground))" },
        sidebar:     {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        /* Tinder custom colors */
        flame:  { 50: "#FFF1F2", 100: "#FFE4E6", 500: "#FF4458", 600: "#E63950", 700: "#CC2D42" },
        hotpink: { 500: "#FD267A" },
        superblue: { 500: "#00D4FF" },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up":   { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        "fade-in":        { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "slide-in":       { from: { opacity: "0", transform: "translateX(-12px)" }, to: { opacity: "1", transform: "translateX(0)" } },
        "scale-up":       { from: { opacity: "0", transform: "scale(0.92)" }, to: { opacity: "1", transform: "scale(1)" } },
        "pulse-glow":     { "0%,100%": { boxShadow: "0 0 0 0 rgba(255,68,88,0.35)" }, "50%": { boxShadow: "0 0 24px 8px rgba(255,68,88,0.12)" } },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
        "fade-in":        "fade-in 0.45s ease-out",
        "slide-in":       "slide-in 0.35s ease-out",
        "scale-up":       "scale-up 0.35s ease-out",
        "pulse-glow":     "pulse-glow 2s ease-in-out infinite",
      },
      fontFamily: {
        sans: ["Inter", "Manrope", "-apple-system", "BlinkMacSystemFont", "SF Pro Rounded", "Segoe UI", "sans-serif"],
        display: ["Manrope", "Inter", "sans-serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
