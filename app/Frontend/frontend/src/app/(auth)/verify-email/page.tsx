import React, { Suspense } from "react";
import type { Metadata } from "next";
import { VerifyEmailForm } from "@/components/auth/verify-email-form";
import { AuthCard } from "@/components/auth/auth-card";

export const metadata: Metadata = {
  title: "Verify Email | Auth Forge",
  description: "Verify your email address using the 6-digit OTP sent to your inbox",
};

export default function VerifyEmailPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-neutral-50 dark:bg-neutral-950">
      <div className="w-full max-w-md">
        <AuthCard
          title="Verify Your Email"
          description="We've sent a 6-digit verification code to your email address"
        >
          <Suspense fallback={<div className="text-center py-6 text-sm text-neutral-500">Loading form...</div>}>
            <VerifyEmailForm />
          </Suspense>
        </AuthCard>
      </div>
    </main>
  );
}
