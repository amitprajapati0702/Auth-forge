"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import axios from "axios";

import { registerSchema, type RegisterInput } from "@/lib/validation/auth";
import { useRegister } from "@/hooks/auth/user-register";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  const registerMutation = useRegister();
  const isLoading = registerMutation.isPending;

  useEffect(() => {
    router.prefetch("/verify-email");
  }, [router]);

  const onSubmit = async (values: RegisterInput) => {
    setServerError(null);

    try {
      await registerMutation.mutateAsync(values);
      
      setRegisteredEmail(values.email);
      setIsSuccess(true);

      toast.success("Account Created!", {
        description: "A 6-digit verification code has been sent to your email.",
        duration: 4000,
      });

      // Redirect to verify email page after smooth animation
      setTimeout(() => {
        router.replace(`/verify-email?email=${encodeURIComponent(values.email)}`);
      }, 1400);
    } catch (error: unknown) {
      let errorMessage = "Registration failed. Please try again.";

      if (axios.isAxiosError(error)) {
        errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setServerError(errorMessage);
      toast.error("Registration Failed", {
        description: errorMessage,
      });
    }
  };

  // Production-Grade Success State Transition
  if (isSuccess) {
    return (
      <div className="py-6 flex flex-col items-center justify-center text-center space-y-5 animate-in fade-in zoom-in-95 duration-300">
        {/* Animated Mail Badge */}
        <div className="relative flex items-center justify-center">
          <div className="absolute h-16 w-16 rounded-full bg-emerald-500/20 dark:bg-emerald-500/30 animate-ping" />
          <div className="relative h-14 w-14 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
            <svg
              className="h-7 w-7 animate-in zoom-in duration-300"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
              />
            </svg>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-1">
          <h3 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            Check Your Email
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-[280px] mx-auto">
            We sent a 6-digit OTP code to{" "}
            <span className="font-medium text-neutral-800 dark:text-neutral-200">
              {registeredEmail}
            </span>
          </p>
        </div>

        {/* Progress & Redirect indicator */}
        <div className="w-full space-y-2 pt-2">
          <div className="h-1.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full animate-[pulse_1s_ease-in-out_infinite] w-full transition-all duration-1000" />
          </div>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 flex items-center justify-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
            Navigating to verification page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {/* Global Error Alert */}
      {serverError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50/80 p-3.5 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300 transition-all"
        >
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
      )}

      {/* Full Name Field */}
      <div className="space-y-1.5">
        <Label htmlFor="fullName" className="text-sm font-medium">
          Full Name
        </Label>
        <Input
          id="fullName"
          placeholder="Enter your full name"
          disabled={isLoading}
          aria-invalid={!!errors.fullName}
          aria-describedby={errors.fullName ? "fullName-error" : undefined}
          className={
            errors.fullName
              ? "border-red-500 focus:ring-red-500 dark:border-red-500"
              : ""
          }
          {...register("fullName")}
        />
        {errors.fullName && (
          <p id="fullName-error" className="text-xs text-red-600 dark:text-red-400 font-medium">
            {errors.fullName.message}
          </p>
        )}
      </div>

      {/* Email Field */}
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-sm font-medium">
          Email Address
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
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
        <Label htmlFor="password" className="text-sm font-medium">
          Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
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
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 focus:outline-none"
          >
            {showPassword ? (
              /* Eye Slash Icon */
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                />
              </svg>
            ) : (
              /* Eye Icon */
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            )}
          </button>
        </div>
        {errors.password && (
          <p id="password-error" className="text-xs text-red-600 dark:text-red-400 font-medium">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Submit Button with Loading State */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full mt-2 h-10 font-semibold transition-all duration-150"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="h-4 w-4 animate-spin text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Creating account...</span>
          </span>
        ) : (
          "Create Account"
        )}
      </Button>

      {/* Redirect / Navigation link */}
      <div className="text-center pt-2 text-sm text-neutral-600 dark:text-neutral-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-neutral-900 hover:underline dark:text-neutral-100"
        >
          Sign in
        </Link>
      </div>
    </form>
  );
}