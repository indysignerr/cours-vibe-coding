"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

/** Bascule clair / sombre, mémorisée. Jamais imposée par le système. */
export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => setDark(document.documentElement.dataset.theme === "dark"), []);

  function toggle() {
    const next = !dark;
    setDark(next);
    if (next) document.documentElement.dataset.theme = "dark";
    else delete document.documentElement.dataset.theme;
    try { localStorage.setItem("theme", next ? "dark" : "light"); } catch {}
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={dark}
      className="pill text-sm hover:border-accent-line"
    >
      {dark ? <Sun aria-hidden className="size-4" /> : <Moon aria-hidden className="size-4" />}
      {dark ? "Light" : "Dark"}
    </button>
  );
}
