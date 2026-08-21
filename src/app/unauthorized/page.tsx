import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { GetApiSession } from "@/lib/session";

export default async function UnauthorizedPage() {

  const session = await GetApiSession();
  const role = session?.user?.role?.[0];

  const dashboardUrl = session?.user && role ? `/${role.toLowerCase()}/dashboard` : "/";
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background px-4">
      <div className="flex max-w-md flex-col items-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 mb-6">
          <AlertCircle className="h-10 w-10 text-destructive" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-8">
          You do not have the required permissions to view this page. If you believe this is a mistake, please contact your administrator.
        </p>
        <Link
          href={dashboardUrl}
          className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
