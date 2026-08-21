"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ArrowLeft, RefreshCcw } from "lucide-react";
import { Footer } from "@/components/layout/footer";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const renderErrorMessage = () => {
    switch (error) {
      case "Configuration":
        return "There is a problem with the server configuration.";
      case "AccessDenied":
        return "You do not have permission to access this account or workspace.";
      case "Verification":
        return "The verification link was invalid or has expired.";
      case "OAuthAccountNotLinked":
        return "To confirm your identity, sign in with the same account you used originally.";
      case "CredentialsSignin":
        return "Sign in failed. Check the credentials you provided and try again.";
      default:
        return "An unexpected error occurred while trying to authenticate your session.";
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4 text-center">
      <div className="my-auto space-y-6 max-w-md mx-auto animate-in fade-in zoom-in-95 duration-300">
        {/* Warning Shield Icon */}
        <div className="flex justify-center">
          <div className="flex items-center justify-center w-24 h-24 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive shadow-inner">
            <ShieldAlert className="w-12 h-12" strokeWidth={1.5} />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Authentication Error
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {renderErrorMessage()}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
          <Link href="/auth/signin" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto text-xs font-semibold gap-1.5 bg-primary text-primary-foreground h-10 px-5 shadow-sm">
              <RefreshCcw className="w-3.5 h-3.5" />
              Try Again
            </Button>
          </Link>

          <Link href="/" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full sm:w-auto text-xs font-medium border-border hover:bg-muted h-10 px-5 gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>

      {/* Credit Footer */}
      <Footer />
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  );
}
