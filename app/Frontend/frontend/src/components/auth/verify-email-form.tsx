"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import axios from "axios";

import { verifyEmailSchema, type VerifyEmailInput } from "@/lib/validation/auth";
import { useVerifyEmail } from "@/hooks/auth/use-verify-email";
import { useResendOtp } from "@/hooks/auth/use-resend-otp";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [resendCooldown, setResendCooldown] = useState<number>(60);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<VerifyEmailInput>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      email: emailParam,
      otp: "",
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const emailValue = watch("email");

  const verifyMutation = useVerifyEmail();
  const resendMutation = useResendOtp();

  const isVerifying = verifyMutation.isPending;
  const isResending = resendMutation.isPending;

  // Set email from URL search params if present
  useEffect(() => {
    if (emailParam) {
      setValue("email", emailParam);
    }
  }, [emailParam, setValue]);

  // Resend OTP Countdown Timer
  useEffect(() => {
    if (resendCooldown <= 0) return;

    const interval = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Handle individual OTP digit change
  const handleDigitChange = (index: number, value: string) => {
    const cleanValue = value.replace(/\D/g, "");

    if (cleanValue.length > 1) {
      // Pasted multiple digits
      const digits = cleanValue.slice(0, 6).split("");
      const newOtp = [...otpDigits];
      digits.forEach((digit, idx) => {
        if (index + idx < 6) {
          newOtp[index + idx] = digit;
        }
      });
      setOtpDigits(newOtp);
      setValue("otp", newOtp.join(""), { shouldValidate: true });

      const nextFocus = Math.min(index + digits.length, 5);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    const newOtp = [...otpDigits];
    newOtp[index] = cleanValue;
    setOtpDigits(newOtp);
    setValue("otp", newOtp.join(""), { shouldValidate: true });

    if (cleanValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle Key Down (Backspace navigation)
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle Pasting full OTP
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pastedData) return;

    const newOtp = ["", "", "", "", "", ""];
    pastedData.split("").forEach((char, idx) => {
      newOtp[idx] = char;
    });

    setOtpDigits(newOtp);
    setValue("otp", pastedData, { shouldValidate: true });

    const focusIdx = Math.min(pastedData.length, 5);
    inputRefs.current[focusIdx]?.focus();
  };

  // Submit Verification
  const onSubmit = async (values: VerifyEmailInput) => {
    setServerError(null);
    setSuccessMessage(null);

    try {
      await verifyMutation.mutateAsync(values);

      const msg = "Email verified successfully! Redirecting to login...";
      setSuccessMessage(msg);
      toast.success("Verification Successful", {
        description: "Your email has been verified. Redirecting to login...",
      });

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error: unknown) {
      let errorMessage = "Invalid or expired verification code.";

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
      toast.error("Verification Failed", {
        description: errorMessage,
      });
    }
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isResending) return;
    if (!emailValue) {
      toast.error("Email required", {
        description: "Please enter your email to resend OTP.",
      });
      return;
    }

    setServerError(null);

    try {
      await resendMutation.mutateAsync(emailValue);
      setResendCooldown(60);
      toast.success("Code Sent", {
        description: "A fresh verification code has been sent to your email.",
      });
    } catch (error: unknown) {
      let errorMessage = "Failed to resend verification code.";

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
      toast.error("Resend Failed", {
        description: errorMessage,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {/* Global Success Banner */}
      {successMessage && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50/80 p-3.5 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300 transition-all"
        >
          <svg
            className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
              clipRule="evenodd"
            />
          </svg>
          <div className="flex-1 font-medium">{successMessage}</div>
        </div>
      )}

      {/* Global Error Banner */}
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

      {/* Email Field */}
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-sm font-medium">
          Email Address
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          disabled={isVerifying}
          aria-invalid={!!errors.email}
          readOnly
          className={
            errors.email
              ? "border-red-500 focus:ring-red-500 dark:border-red-500"
              : ""
          }
          {...register("email")}
        />
        {errors.email && (
          <p className="text-xs text-red-600 dark:text-red-400 font-medium">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* 6-Digit OTP Field */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Verification Code</Label>
          <span className="text-xs text-neutral-500">6-digit OTP</span>
        </div>

        <div className="flex items-center justify-between gap-2">
          {otpDigits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              disabled={isVerifying}
              onChange={(e) => handleDigitChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className={`h-12 w-11 sm:w-12 text-center text-lg font-bold rounded-lg border bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-sm transition-all focus:outline-none focus:ring-2 ${
                errors.otp
                  ? "border-red-500 focus:ring-red-500"
                  : "border-neutral-300 dark:border-neutral-700 focus:ring-neutral-900 dark:focus:ring-neutral-300"
              }`}
            />
          ))}
        </div>

        {errors.otp && (
          <p className="text-xs text-red-600 dark:text-red-400 font-medium text-center">
            {errors.otp.message}
          </p>
        )}
      </div>

      {/* Resend OTP Timer & Button */}
      <div className="flex items-center justify-between pt-1 text-sm">
        <span className="text-neutral-500 dark:text-neutral-400">
          Didn&apos;t receive the code?
        </span>

        {resendCooldown > 0 ? (
          <span className="font-medium text-neutral-500 dark:text-neutral-400">
            Resend in{" "}
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              {resendCooldown}s
            </span>
          </span>
        ) : (
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={isResending || isVerifying}
            className="font-medium text-neutral-900 dark:text-neutral-100 hover:underline disabled:opacity-50 cursor-pointer"
          >
            {isResending ? "Sending..." : "Resend OTP"}
          </button>
        )}
      </div>

      {/* Verify Button */}
      <Button
        type="submit"
        disabled={isVerifying || otpDigits.join("").length < 6}
        className="w-full h-10 font-semibold"
      >
        {isVerifying ? (
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
            <span>Verifying...</span>
          </span>
        ) : (
          "Verify Email"
        )}
      </Button>

      {/* Navigation Links */}
      <div className="text-center pt-2 text-sm text-neutral-600 dark:text-neutral-400">
        Already verified?{" "}
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
