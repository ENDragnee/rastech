import { GetSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await GetSession();
  const user = session.user;
  if (!user) {
    redirect("/auth/signin")
  }
  const userRoles = Array.isArray(user.role) ? user.role : [user.role];

  // Strictly ADMIN only
  if (!userRoles.includes("ADMIN")) {
    redirect("/unauthorized");
  }

  return <>{children}</>;
}
