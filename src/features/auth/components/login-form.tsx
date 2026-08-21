"use client";

import { useState } from "react";
import type { SyntheticEvent } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Lock, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function LoginForm() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await signIn("credentials", {
        userName: userName.trim(),
        password: password.trim(),
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid username or password");
        toast.error("Authentication failed. Please check credentials.");
        setIsLoading(false);
      } else {
        toast.success("Welcome back!");

        // Retrieve session to resolve user's role for direct redirection
        const session = await getSession();
        const userRoles = Array.isArray(session?.user?.role)
          ? session.user.role
          : [session?.user?.role || "STAFF"];

        let targetHref = "/cashier/dashboard";
        if (userRoles.includes("ADMIN")) {
          targetHref = "/admin/dashboard";
        } else if (userRoles.includes("MANAGER")) {
          targetHref = "/manager/dashboard";
        } else if (userRoles.includes("CASHIER")) {
          targetHref = "/cashier/dashboard";
        }

        router.push(targetHref);
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* Username */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-foreground" htmlFor="userName">
          Username
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="userName"
            type="text"
            placeholder="e.g. admin, manager, cashier"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            required
            disabled={isLoading}
            className="pl-9 h-10 text-xs bg-background border-border"
            autoFocus
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-foreground" htmlFor="password">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            className="pl-9 pr-9 h-10 text-xs bg-background border-border"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Sign In Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-10 font-semibold text-xs transition-all bg-primary text-primary-foreground shadow-sm"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Authenticating...
          </span>
        ) : (
          "Sign In to Account"
        )}
      </Button>
    </form>
  );
}
