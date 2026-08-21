import { GetSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function ManagerLayout({
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

  // Manager and Admin can access /manager routes
  const isAuthorized =
    userRoles.includes("MANAGER") || userRoles.includes("ADMIN");

  if (!isAuthorized) {
    redirect("/unauthorized");
  }

  return <>{children}</>;
}
