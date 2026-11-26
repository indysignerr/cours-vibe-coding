import type { Config } from "tailwindcss";

/**
 * Jetons pilotés par les variables CSS de globals.css : la peau du site
 * se change à un seul endroit. Palette Albert LIGHT : ivoire, marine, beige.
 */
export default {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        canvas: "var(--canvas)",
        surface: "var(--surface)",
        sunken: "var(--sunken)",
        "ink-surface": "var(--ink-surface)",
        ink: "var(--ink)",
        body: "var(--body)",
        muted: "var(--muted)",
        "on-ink": "var(--on-ink)",
        accent: "var(--accent)",
        "accent-hover": "var(--accent-hover)",
        "accent-tint": "var(--accent-tint)",
        "on-accent": "var(--on-accent)",
        brand: "var(--brand)",
        "brand-soft": "var(--brand-soft)",
        line: "var(--line)",
        "line-strong": "var(--line-strong)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "Times New Roman", "serif"],
        serif: ["var(--font-serif)", "Georgia", "Times New Roman", "serif"],
        sans: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      fontSize: {
        // Le corps ne descend jamais sous 17 px : le site sert aussi de support projeté.
        sm: ["1rem", { lineHeight: "1.5" }],
        base: ["1.0625rem", { lineHeight: "1.6" }],
      },
      maxWidth: { measure: "64ch", stage: "80rem", prose: "44rem" },
      // Des angles droits partout : la charte n'arrondit rien.
      borderRadius: { card: "0px", btn: "0px" },
      transitionTimingFunction: { swift: "cubic-bezier(0.22, 1, 0.36, 1)" },
    },
  },
  plugins: [],
} satisfies Config;
