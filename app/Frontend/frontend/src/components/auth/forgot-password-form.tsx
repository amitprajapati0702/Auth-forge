"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import axios from "axios";
import { Mail, ArrowLeft, CheckCircle2, RotateCw } from "lucide-react";

import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/validation/auth";
import { useForgotPassword } from "@/hooks/auth/use-forgot-password";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
    mode: "onBlur",
  });

  const forgotPasswordMutation = useForgotPassword();
  const isLoading = forgotPasswordMutation.isPending;

  const onSubmit = async (values: ForgotPasswordInput) => {
    setServerError(null);

    try {
      await forgotPasswordMutation.mutateAsync(values);
      setSubmittedEmail(values.email);
      setIsSuccess(true);
      toast.success("Reset link sent!", {
        description: "If an account with that email exists, we've sent instructions to reset your password.",
      });
    } catch (error: unknown) {
      let errorMessage = "Unable to process password reset. Please try again.";
      if (axios.isAxiosError(error)) {
        errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      setServerError(errorMessage);
      toast.error("Request failed", { description: errorMessage });
    }
  };

  const handleResend = async () => {
    if (!submittedEmail) return;
    try {
      await forgotPasswordMutation.mutateAsync({ email: submittedEmail });
      toast.success("Reset link resent!", {
        description: `A new reset link has been dispatched to ${submittedEmail}.`,
      });
    } catch {
      toast.error("Failed to resend reset link");
    }
  };

  if (isSuccess) {
    return (
      <div className="py-4 flex flex-col items-center justify-center text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
          <CheckCircle2 className="w-7 h-7" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
            Check your inbox
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-[320px] mx-auto leading-relaxed">
            We sent a password reset link to{" "}
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              {submittedEmail}
            </span>
            . Please check your spam folder if you don&apos;t see it within a few minutes.
          </p>
        </div>

        <div className="w-full space-y-3 pt-2">
          <Button
            variant="outline"
            onClick={handleResend}
            disabled={isLoading}
            className="w-full h-10 rounded-xl text-xs font-semibold cursor-pointer"
          >
            <RotateCw className={`w-3.5 h-3.5 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "Resending..." : "Resend reset link"}
          </Button>

          <Link href="/login" className="block">
            <Button
              variant="ghost"
              className="w-full h-10 rounded-xl text-xs font-medium text-neutral-600 dark:text-neutral-300"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-2" />
              Back to Sign in
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {serverError && (
        <div
          role="alert"
          className="p-3.5 rounded-xl border border-red-200 bg-red-50 text-xs text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
        >
          {serverError}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-xs font-medium">
          Registered Email Address
        </Label>
        <div className="relative">
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            disabled={isLoading}
            className={`pl-9 rounded-xl text-xs h-10 ${
              errors.email ? "border-red-500 focus:ring-red-500" : ""
            }`}
            {...register("email")}
          />
          <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3 pointer-events-none" />
        </div>
        {errors.email && (
          <p className="text-xs text-red-600 dark:text-red-400 font-medium">
            {errors.email.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-10 rounded-xl font-semibold text-xs transition-all duration-150 cursor-pointer"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Sending reset link...
          </span>
        ) : (
          "Send Password Reset Link"
        )}
      </Button>

      <div className="text-center pt-2">
        <Link
          href="/login"
          className="inline-flex items-center text-xs font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:underline transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
          Back to Sign in
        </Link>
      </div>
    </form>
  );
}

export default ForgotPasswordForm;
