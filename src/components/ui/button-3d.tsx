import type { ComponentProps } from "react";

type Tone = "accent" | "ink" | "done" | "xp" | "ghost";

const TONE: Record<Tone, string> = {
  accent: "",
  ink: "btn-3d--ink",
  done: "btn-3d--done",
  xp: "btn-3d--xp",
  ghost: "btn-3d--ghost",
};

/** Le bouton épais qui s'enfonce. Lien si href, bouton sinon. */
export function Button3d({
  tone = "accent",
  className = "",
  href,
  ...rest
}: { tone?: Tone; href?: string } & ComponentProps<"button"> & { href?: string }) {
  const cls = `btn-3d ${TONE[tone]} ${className}`.trim();
  if (href) {
    return (
      <a className={cls} href={href}>
        {rest.children}
      </a>
    );
  }
  return <button className={cls} type="button" {...rest} />;
}
