import { getActionSession } from "@/lib/auth-options";
import { ROLES } from "@/lib/redirector";
import { redirect } from "next/navigation";

export default async function CashierLayout({ children }: { children: React.ReactNode }) {
  try {
    const user = await getActionSession();
    if (!user.role.includes(ROLES.CASHIER)) {
      redirect("/unauthorized");
    }
  } catch (error) {
    redirect("/auth/signin");
  }

  return <>{children}</>;
}
