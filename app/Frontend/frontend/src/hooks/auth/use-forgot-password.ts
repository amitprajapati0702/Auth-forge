"use client";

import { useMutation } from "@tanstack/react-query";
import { forgotPasswordApi } from "@/lib/api/auth-api";
import type { ForgotPasswordInput } from "@/lib/validation/auth";

export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: ForgotPasswordInput) => forgotPasswordApi(data),
  });
}
