import { getActionSession } from "@/lib/auth-options";
import { ROLES } from "@/lib/redirector";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  try {
    const user = await getActionSession();
    if (!user.role.includes(ROLES.ADMIN)) {
      redirect("/unauthorized");
    }
  } catch (error) {
    redirect("/unauthorized");
  }

  return <>{children}</>;
}
