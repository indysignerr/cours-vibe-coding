import type { Metadata } from "next";
import { SignupBoard } from "@/app/admin/signup-board";
import { AuthGate } from "@/components/auth-gate";
import { PageHead, Shell } from "@/components/shell";

export const metadata: Metadata = {
  title: "Sign-ups",
  robots: { index: false, follow: false },
};

/** Réservé aux organisateurs. Le verrou est la RLS, pas cette page. */
export default function AdminPage() {
  return (
    <Shell>
      <PageHead
      eyebrow="Organisers"
      title="Who is coming."
      lede="The sign-up lists, one block per event. The names never leave this page unless you download them." />
      <div>
      <AuthGate requireAdmin>
        <SignupBoard />
      </AuthGate>
    </div>
    </Shell>
  );
}
