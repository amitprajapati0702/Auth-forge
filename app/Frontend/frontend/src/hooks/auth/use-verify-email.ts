"use client";

import { useMutation } from "@tanstack/react-query";
import { verifyEmailApi } from "@/lib/api/auth-api";
import type { VerifyEmailInput } from "@/lib/validation/auth";

export function useVerifyEmail() {
  return useMutation({
    mutationFn: (data: VerifyEmailInput) => verifyEmailApi(data),
  });
}
