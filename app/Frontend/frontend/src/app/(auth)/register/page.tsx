import type { Metadata } from "next";
import RegisterForm from "@/components/auth/register-form";
import { AuthCard } from "@/components/auth/auth-card";

export const metadata: Metadata = {
  title: "Create an Account | Auth Forge",
  description: "Register for a new Auth Forge account",
};

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-neutral-50 dark:bg-neutral-950">
      <div className="w-full max-w-md">
        <AuthCard
          title="Create an account"
          description="Enter your details below to create your account"
        >
          <RegisterForm />
        </AuthCard>
      </div>
    </main>
  );
}
