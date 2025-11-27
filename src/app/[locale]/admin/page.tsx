import { cookies } from "next/headers";
import {
  ADMIN_SESSION_COOKIE_NAME,
  verifyAdminSessionToken,
} from "@/lib/adminAuth";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { buildAdminStats } from "@/lib/adminStats";
import { fetchSheetGameRecords } from "@/lib/games";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin dashboard for Funopi",
};

export default async function AdminPage() {
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

  const [stats, games] = await Promise.all([
    buildAdminStats(),
    fetchSheetGameRecords().catch(() => []),
  ]);

  return <AdminDashboard initialStats={stats} initialGames={games} />;
}
