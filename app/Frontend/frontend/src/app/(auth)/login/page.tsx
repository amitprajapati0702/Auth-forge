import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { AuthCard } from "@/components/auth/auth-card";

export const metadata: Metadata = {
  title: "Sign In | Auth Forge",
  description: "Sign in to access your Auth Forge account",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-neutral-50 dark:bg-neutral-950">
      <div className="w-full max-w-md">
        <AuthCard
          title="Welcome back"
          description="Enter your email and password to sign in"
        >
          <LoginForm />
        </AuthCard>
      </div>
    </main>
  );
}
