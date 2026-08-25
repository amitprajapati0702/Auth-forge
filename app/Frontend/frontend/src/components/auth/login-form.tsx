"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import axios from "axios";
import { Loader2 } from "lucide-react";

import { loginSchema, type LoginInput } from "@/lib/validation/auth";
import { useLogin } from "@/hooks/auth/use-login";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordToggleIcon } from "@/components/ui/password-toggle-icon";

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
  });

  const loginMutation = useLogin();
  const isLoading = loginMutation.isPending;

  // Cleanup redirect timer on unmount
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    };
  }, []);

  // Prefetch dashboard for instant transition
  useEffect(() => {
    router.prefetch("/dashboard");
  }, [router]);

  const onSubmit = async (values: LoginInput) => {
    setServerError(null);
    setUnverifiedEmail(null);

    try {
      const response = await loginMutation.mutateAsync(values);

      setUserEmail(values.email);
      setIsSuccess(true);

      // Trigger rich production-grade toast
      toast.success("Welcome back!", {
        description: response?.message || "Successfully authenticated. Redirecting...",
        duration: 3000,
      });

      // Smooth delay allowing user to perceive confirmation & animation before redirect
      redirectTimerRef.current = setTimeout(() => {
        router.replace("/dashboard");
      }, 1200);
    } catch (error: unknown) {
      let errorMessage = "Invalid email or password. Please try again.";
      let errorCode = "";

      if (axios.isAxiosError(error)) {
        errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          errorMessage;
        errorCode = error.response?.data?.errorCode || error.response?.data?.errorcode || "";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      // Check if user account is not verified
      if (
        errorCode === "EMAIL_NOT_VERIFIED" ||
        errorMessage.toLowerCase().includes("not verified")
      ) {
        setUnverifiedEmail(values.email);
      }

      setServerError(errorMessage);
      toast.error("Sign in failed", {
        description: errorMessage,
      });
    }
  };

  // Production-grade Full Success State View
  if (isSuccess) {
    return (
      <div className="py-6 flex flex-col items-center justify-center text-center space-y-5 animate-in fade-in zoom-in-95 duration-300">
        {/* Animated Checkmark Badge */}
        <div className="relative flex items-center justify-center">
          <div className="absolute h-16 w-16 rounded-full bg-emerald-500/20 dark:bg-emerald-500/30 animate-ping" />
          <div className="relative h-14 w-14 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
            <svg
              className="h-7 w-7 animate-in zoom-in duration-300"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-1">
          <h3 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            Login Successful
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-[260px] mx-auto">
            Signed in as <span className="font-medium text-neutral-800 dark:text-neutral-200">{userEmail}</span>
          </p>
        </div>

        {/* Loading Progress Bar & Redirect Text */}
        <div className="w-full space-y-2 pt-2">
          <div className="h-1.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full animate-[pulse_1s_ease-in-out_infinite] w-full transition-all duration-1000" />
          </div>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 flex items-center justify-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
            Redirecting to your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* eslint-disable-next-line react-hooks/refs */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Global Error Alert */}
        {serverError && (
          <div
            role="alert"
            className="flex flex-col gap-2 rounded-lg border border-red-200 bg-red-50/80 p-3.5 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300 transition-all"
          >
            <div className="flex items-start gap-3">
              <svg
                className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400 mt-0.5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1 font-medium">{serverError}</div>
            </div>

            {unverifiedEmail && (
              <div className="pl-8 pt-1">
                <Link
                  href={`/verify-email?email=${encodeURIComponent(unverifiedEmail)}`}
                  className="text-xs font-semibold underline hover:text-red-950 dark:hover:text-red-200 transition-colors"
                >
                  Click here to verify your email address &rarr;
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Email Field */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-medium">
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            disabled={isLoading}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={
              errors.email
                ? "border-red-500 focus:ring-red-500 dark:border-red-500"
                : ""
            }
            {...register("email")}
          />
          {errors.email && (
            <p id="email-error" className="text-xs text-red-600 dark:text-red-400 font-medium">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:underline dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              disabled={isLoading}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
              className={`pr-10 ${
                errors.password
                  ? "border-red-500 focus:ring-red-500 dark:border-red-500"
                  : ""
              }`}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 focus:outline-none disabled:opacity-50"
            >
              <PasswordToggleIcon visible={showPassword} />
            </button>
          </div>
          {errors.password && (
            <p id="password-error" className="text-xs text-red-600 dark:text-red-400 font-medium">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 h-10 font-semibold transition-all duration-150"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Signing in...</span>
            </span>
          ) : (
            "Sign In"
          )}
        </Button>

        {/* Register Redirection Link */}
        <div className="text-center pt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-neutral-900 hover:underline dark:text-neutral-100"
          >
            Sign up
          </Link>
        </div>
      </form>
    </div>
  );
}

export default LoginForm;