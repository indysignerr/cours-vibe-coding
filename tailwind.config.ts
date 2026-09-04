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
        accent: "var(--accent)",
        "accent-ink": "var(--accent-ink)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        // Le support est projeté : rien sous 1rem dans le corps de texte.
        "display-xl": ["clamp(3rem, 9vw, 7.5rem)", { lineHeight: "0.92", letterSpacing: "-0.03em" }],
        "display-lg": ["clamp(2.25rem, 5.5vw, 4.5rem)", { lineHeight: "0.98", letterSpacing: "-0.02em" }],
        "display-md": ["clamp(1.75rem, 3.5vw, 2.75rem)", { lineHeight: "1.05", letterSpacing: "-0.01em" }],
        project: ["clamp(1.125rem, 1.4vw, 1.5rem)", { lineHeight: "1.55" }],
      },
      maxWidth: { measure: "68ch", stage: "88rem" },
      transitionTimingFunction: { swift: "cubic-bezier(0.22, 1, 0.36, 1)" },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
