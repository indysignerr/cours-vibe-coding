import type { Metadata } from "next";
import { SignupBoard } from "./signup-board";
import { AuthGate } from "@/components/auth-gate";
import { PageFrame } from "@/components/page-frame";
import { PageHead } from "@/components/page-head";

export const metadata: Metadata = {
  title: "Sign-ups",
  robots: { index: false, follow: false },
};

/** Réservé aux organisateurs. Le verrou est la RLS, pas cette page. */
export default function AdminPage() {
  return (
    <PageFrame lang="en" page={null}>
      <PageHead
        eyebrow="Organisers"
        title="Who is coming."
        lede="The sign-up lists, one block per event. The names never leave this page unless you download them."
      />
      <div className="container doc">
        <AuthGate requireAdmin>
          <SignupBoard />
        </AuthGate>
      </div>
    </PageFrame>
  );
}
