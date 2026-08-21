import { Metadata } from "next";
import { AuthLayout } from "@/components/layout/auth-layout";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Log in to Rastech Electronics Stock & POS System",
};

export default function SignInPage() {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Enter your credentials to access your authorized console"
    >
      <LoginForm />
    </AuthLayout>
  );
}
