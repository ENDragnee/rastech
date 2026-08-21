import { GetSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function CashierLayout({
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

  const isAuthorized =
    userRoles.includes("CASHIER") ||
    userRoles.includes("MANAGER") ||
    userRoles.includes("ADMIN");

  if (!isAuthorized) {
    redirect("/unauthorized");
  }

  return <>{children}</>;
}
