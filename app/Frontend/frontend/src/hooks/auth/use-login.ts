"use client";

import { useMutation } from "@tanstack/react-query";
import { loginuser } from "@/lib/api/auth-api";
import type { LoginInput } from "@/lib/validation/auth";

export function useLogin() {
  return useMutation({
    mutationFn: (data: LoginInput) => loginuser(data),
  });
}
