import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { GetSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const { user } = await GetSession();
  if (!user) {
    redirect("/unauthorized")
  }
  return <DashboardLayout user={user}>{children}</DashboardLayout>;
}
