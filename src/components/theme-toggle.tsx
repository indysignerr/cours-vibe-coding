"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => { listeners.add(cb); return () => listeners.delete(cb); };
const read = () => (typeof document === "undefined" ? false : document.documentElement.dataset.theme === "dark");

/** Bascule clair / sombre, mémorisée. Jamais imposée par le système. */
export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const dark = useSyncExternalStore(subscribe, read, () => false);

  function toggle() {
    const next = !dark;
    if (next) document.documentElement.dataset.theme = "dark";
    else delete document.documentElement.dataset.theme;
    try { localStorage.setItem("theme", next ? "dark" : "light"); } catch {}
    listeners.forEach((cb) => cb());
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={dark}
      aria-label="Dark mode"
      className={`pill text-sm hover:border-accent-line ${compact ? "px-3" : ""}`}
    >
      {dark ? <Sun aria-hidden className="size-4" /> : <Moon aria-hidden className="size-4" />}
      {compact ? null : <span>Dark mode</span>}
    </button>
  );
}
