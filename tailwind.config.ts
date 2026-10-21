import type { Config } from "tailwindcss";

/**
 * Jetons pilotés par les variables CSS de globals.css : changer la peau du
 * site se fait à un seul endroit. Rayons conservateurs, ombres qui servent
 * de bordure, aucune couleur vive dans la palette utilitaire.
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
        // Alias hérité des pages membres : « paper » = texte sur fond marine.
        paper: "var(--on-ink)",
        line: "var(--line)",
        "line-strong": "var(--line-strong)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        // Le corps ne descend jamais sous 17 px. text-sm sert aux libellés.
        sm: ["0.9375rem", { lineHeight: "1.5" }],
        base: ["1.0625rem", { lineHeight: "1.65" }],
      },
      maxWidth: { measure: "66ch", stage: "76rem", prose: "44rem" },
      boxShadow: {
        hair: "var(--hair)",
        lift: "var(--lift)",
        "lift-lg": "var(--lift-lg)",
      },
      borderRadius: { card: "12px", btn: "7px" },
      transitionTimingFunction: { swift: "cubic-bezier(0.22, 1, 0.36, 1)" },
    },
  },
  plugins: [],
} satisfies Config;
