"use client";

import { useId, useState } from "react";
import { SITE } from "@/lib/site";

/**
 * Le formulaire de contact.
 *
 * Le site est un export statique : il n'y a pas de serveur pour recevoir
 * un POST. Le formulaire compose donc un email propre et l'ouvre dans le
 * client du visiteur — rien n'est envoyé à notre insu, et le message part
 * de sa propre adresse, ce qui vaut mieux pour la réponse.
 *
 * Tant que l'adresse n'existe pas, on le dit au lieu d'afficher un
 * formulaire qui ne mène nulle part.
 */
export function ContactForm() {
  const id = useId();
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  if (!SITE.contactEmail) {
    return (
      <div className="card card--sand p-7">
        <h3 className="display-3">The form is not live yet.</h3>
        <p className="mt-3 text-body">
          Our address is being set up. Until then, reach us through {SITE.school} {SITE.campus} or
          any member of the team.
        </p>
        <p className="mt-4 text-sm text-muted">
          For the organisers: fill <code className="rounded bg-canvas px-1.5 py-0.5">contactEmail</code>{" "}
          in <code className="rounded bg-canvas px-1.5 py-0.5">src/lib/site.ts</code> and this form
          turns itself on.
        </p>
      </div>
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const body = [
      `Name: ${name}`,
      company ? `Company: ${company}` : null,
      `Email: ${email}`,
      "",
      message,
    ]
      .filter(Boolean)
      .join("\n");
    window.location.href = `mailto:${SITE.contactEmail}?subject=${encodeURIComponent(
      `Enquiry from ${company || name}`,
    )}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }

  const field = "field mt-2";

  return (
    <form onSubmit={submit} noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-ink" htmlFor={`${id}-name`}>
            Name
          </label>
          <input id={`${id}-name`} className={field} required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink" htmlFor={`${id}-company`}>
            Company <span className="font-normal text-muted">Optional</span>
          </label>
          <input id={`${id}-company`} className={field} autoComplete="organization" value={company} onChange={(e) => setCompany(e.target.value)} />
        </div>
      </div>

      <label className="mt-5 block text-sm font-medium text-ink" htmlFor={`${id}-email`}>
        Email
      </label>
      <input id={`${id}-email`} className={field} type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />

      <label className="mt-5 block text-sm font-medium text-ink" htmlFor={`${id}-message`}>
        What would you like to stop doing by hand?
      </label>
      <textarea id={`${id}-message`} className={`${field} min-h-[8rem]`} required rows={5} value={message} onChange={(e) => setMessage(e.target.value)} />

      <button type="submit" className="btn btn--primary mt-7">
        Send
      </button>

      {sent ? (
        <p role="status" className="card card--sand mt-5 p-4 text-ink">
          Your email client should have opened with the message ready. If nothing happened, write to{" "}
          <a className="text-accent underline underline-offset-4" href={`mailto:${SITE.contactEmail}`}>
            {SITE.contactEmail}
          </a>
          .
        </p>
      ) : (
        <p className="mt-4 max-w-measure text-sm text-muted">
          This opens your own email client with the message filled in. Nothing is sent from this
          page, and we store nothing here.
        </p>
      )}
    </form>
  );
}
