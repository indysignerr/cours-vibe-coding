import type { Config } from "tailwindcss";

// Identité provisoire. Tout est piloté par les variables CSS de globals.css,
// donc changer la palette de l'asso se fait à un seul endroit.
export default {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "var(--ink)",
        paper: "var(--paper)",
        surface: "var(--surface)",
        muted: "var(--muted)",
        line: "var(--line)",
        sunken: "var(--sunken)",
        accent: "var(--accent)",
        "accent-line": "var(--accent-line)",
        "accent-strong": "var(--accent-strong)",
        "accent-ink": "var(--accent-ink)",
        done: "var(--done)",
        "done-line": "var(--done-line)",
        "done-strong": "var(--done-strong)",
        streak: "var(--streak)",
        "streak-line": "var(--streak-line)",
        "streak-strong": "var(--streak-strong)",
        xp: "var(--xp)",
        "xp-line": "var(--xp-line)",
        "xp-strong": "var(--xp-strong)",
        "on-fill": "var(--on-fill)",
        "ink-line": "var(--ink-line)",
        "line-strong": "var(--line-strong)",
        "code-bg": "var(--code-bg)",
        "code-ink": "var(--code-ink)",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        // Le support est projeté : jamais sous 17 px en courant. text-sm = 16 px
        // pour les libellés, text-xs reste réservé aux surtitres et captions.
        sm: ["1rem", { lineHeight: "1.5" }],
        base: ["1.0625rem", { lineHeight: "1.6" }],
        "display-xl": ["clamp(3rem, 9vw, 7.5rem)", { lineHeight: "0.92", letterSpacing: "-0.03em" }],
        "display-lg": ["clamp(2.25rem, 5.5vw, 4.5rem)", { lineHeight: "0.98", letterSpacing: "-0.02em" }],
        "display-md": ["clamp(1.75rem, 3.5vw, 2.75rem)", { lineHeight: "1.05", letterSpacing: "-0.01em" }],
        project: ["clamp(1.125rem, 1.4vw, 1.5rem)", { lineHeight: "1.55" }],
      },
      maxWidth: { measure: "68ch", stage: "88rem" },
      boxShadow: { lift: "var(--lift)" },
      borderRadius: { card: "20px", pill: "999px" },
      transitionTimingFunction: { swift: "cubic-bezier(0.22, 1, 0.36, 1)" },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
