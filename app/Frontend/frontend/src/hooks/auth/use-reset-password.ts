"use client";

import { useMutation } from "@tanstack/react-query";
import { resetPasswordApi } from "@/lib/api/auth-api";
import type { ResetPasswordInput } from "@/lib/validation/auth";

export function useResetPassword() {
  return useMutation({
    mutationFn: (data: Pick<ResetPasswordInput, "token" | "newPassword">) =>
      resetPasswordApi(data),
  });
}
