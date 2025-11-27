import { cookies } from "next/headers";
import {
  ADMIN_SESSION_COOKIE_NAME,
  verifyAdminSessionToken,
} from "@/lib/adminAuth";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import AdminRatingsView from "@/components/admin/AdminRatingsView";
import { buildSiteRatingSummaries } from "@/lib/adminRatings";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Ratings",
  description: "Admin ratings for Funopi",
};

export default async function AdminRatingsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  const session = verifyAdminSessionToken(token);

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-4">
        <AdminLoginForm />
      </main>
    );
  }

  const summaries = await buildSiteRatingSummaries();
  return <AdminRatingsView summaries={summaries} />;
}
