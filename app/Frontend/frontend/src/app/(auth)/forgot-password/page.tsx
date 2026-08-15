import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { AuthCard } from "@/components/auth/auth-card";

export const metadata: Metadata = {
  title: "Forgot Password | Auth Forge",
  description: "Reset your Auth Forge password",
};

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-neutral-50 dark:bg-neutral-950">
      <div className="w-full max-w-md">
        <AuthCard
          title="Forgot password?"
          description="Enter your email to receive a password reset link."
        >
          <ForgotPasswordForm />
        </AuthCard>
      </div>
    </main>
  );
}
