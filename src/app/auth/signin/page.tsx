import { Metadata } from "next";
import { AuthLayout } from "@/components/layout/auth-layout";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Sign In | Rastech",
  description: "Log in to Rastech Stock Management System",
};

export default function SignInPage() {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Enter your credentials to access inventory & POS"
    >
      <LoginForm />
    </AuthLayout>
  );
}
