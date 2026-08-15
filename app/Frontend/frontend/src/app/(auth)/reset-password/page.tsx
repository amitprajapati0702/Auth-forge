import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { AuthCard } from "@/components/auth/auth-card";

export const metadata: Metadata = {
  title: "Reset Password | Auth Forge",
  description: "Set a new password for your Auth Forge account",
};

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-neutral-50 dark:bg-neutral-950">
      <div className="w-full max-w-md">
        <AuthCard
          title="Reset your password"
          description="Enter and confirm your new secure password."
        >
          <Suspense
            fallback={
              <div className="py-8 flex flex-col items-center justify-center space-y-3">
                <div className="w-6 h-6 border-2 border-neutral-900 dark:border-neutral-100 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-neutral-400">Loading reset session...</p>
              </div>
            }
          >
            <ResetPasswordForm />
          </Suspense>
        </AuthCard>
      </div>
    </main>
  );
}
