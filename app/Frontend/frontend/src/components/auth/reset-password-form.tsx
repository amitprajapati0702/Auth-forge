"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import axios from "axios";
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/validation/auth";
import { useResetPassword } from "@/hooks/auth/use-reset-password";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";


export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const resetPasswordMutation = useResetPassword();
  const isLoading = resetPasswordMutation.isPending;

  const onSubmit = async (values: ResetPasswordInput) => {
    setServerError(null);

    if (!token) {
      setServerError("Reset token is missing from the link. Please request a new password reset.");
      return;
    }

    try {
      await resetPasswordMutation.mutateAsync({
        token,
        newPassword: values.newPassword,
      });

      setIsSuccess(true);
      toast.success("Password reset successfully!", {
        description: "You can now log in with your updated password.",
      });

      setTimeout(() => {
        router.replace("/login");
      }, 1500);
    } catch (error: unknown) {
      let errorMessage = "Invalid or expired password reset link. Please request a new one.";
      if (axios.isAxiosError(error)) {
        errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      setServerError(errorMessage);
      toast.error("Password reset failed", { description: errorMessage });
    }
  };

  // If no token in URL
  if (!token && !isSuccess) {
    return (
      <div className="py-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
            Invalid Reset Link
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-[280px] mx-auto">
            This password reset link is invalid or incomplete. Please request a fresh reset link.
          </p>
        </div>
        <Link href="/forgot-password" className="block pt-2">
          <Button className="w-full h-10 rounded-xl text-xs font-semibold">
            Request New Reset Link
          </Button>
        </Link>
      </div>
    );
  }

  // Success view
  if (isSuccess) {
    return (
      <div className="py-6 flex flex-col items-center justify-center text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
          <CheckCircle2 className="w-7 h-7" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
            Password Reset Complete
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-[280px] mx-auto">
            Your password has been securely updated. Redirecting you to sign in...
          </p>
        </div>

        <div className="w-full space-y-2 pt-2">
          <div className="h-1.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full animate-pulse w-full" />
          </div>
          <Link href="/login">
            <Button className="w-full h-10 rounded-xl text-xs font-semibold mt-2">
              Sign In Now <ArrowRight className="w-3.5 h-3.5 ml-2" />
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

      {/* Hidden Token Input */}
      <input type="hidden" {...register("token")} />

      {/* New Password Field */}
      <div className="space-y-1.5">
        <Label htmlFor="newPassword" className="text-xs font-medium">
          New Password
        </Label>
        <div className="relative">
          <Input
            id="newPassword"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="••••••••"
            disabled={isLoading}
            className={`pr-10 pl-9 rounded-xl text-xs h-10 ${
              errors.newPassword ? "border-red-500 focus:ring-red-500" : ""
            }`}
            {...register("newPassword")}
          />
          <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3 pointer-events-none" />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.newPassword && (
          <p className="text-xs text-red-600 dark:text-red-400 font-medium">
            {errors.newPassword.message}
          </p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword" className="text-xs font-medium">
          Confirm New Password
        </Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="••••••••"
            disabled={isLoading}
            className={`pr-10 pl-9 rounded-xl text-xs h-10 ${
              errors.confirmPassword ? "border-red-500 focus:ring-red-500" : ""
            }`}
            {...register("confirmPassword")}
          />
          <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3 pointer-events-none" />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            tabIndex={-1}
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-red-600 dark:text-red-400 font-medium">
            {errors.confirmPassword.message}
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
            Updating password...
          </span>
        ) : (
          "Reset Password"
        )}
      </Button>

      <div className="text-center pt-2">
        <Link
          href="/login"
          className="text-xs font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:underline"
        >
          Cancel and return to Sign In
        </Link>
      </div>
    </form>
  );
}

export default ResetPasswordForm;
