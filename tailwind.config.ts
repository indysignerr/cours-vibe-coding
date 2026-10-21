import type { Config } from "tailwindcss";

/**
 * Jetons pilotés par les variables CSS de globals.css : la peau du site
 * se change à un seul endroit. Palette Albert L.I.G.H.T., marine et beige.
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
        "on-ink-muted": "var(--on-ink-muted)",
        accent: "var(--accent)",
        "accent-hover": "var(--accent-hover)",
        "accent-tint": "var(--accent-tint)",
        "on-accent": "var(--on-accent)",
        brand: "var(--brand)",
        "brand-soft": "var(--brand-soft)",
        // Alias hérité des pages membres : « paper » = texte sur fond marine.
        paper: "var(--on-ink)",
        line: "var(--line)",
        "line-strong": "var(--line-strong)",
      },
      fontFamily: {
        display: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      fontSize: {
        // Le corps ne descend jamais sous 17 px : le site sert aussi de support projeté.
        sm: ["0.9375rem", { lineHeight: "1.5" }],
        base: ["1.0625rem", { lineHeight: "1.65" }],
      },
      maxWidth: { measure: "64ch", stage: "76rem", prose: "44rem" },
      boxShadow: {
        hair: "var(--hair)",
        lift: "var(--lift)",
        "lift-lg": "var(--lift-lg)",
      },
      borderRadius: { card: "14px", btn: "10px" },
      transitionTimingFunction: { swift: "cubic-bezier(0.22, 1, 0.36, 1)" },
    },
  },
  plugins: [],
} satisfies Config;
