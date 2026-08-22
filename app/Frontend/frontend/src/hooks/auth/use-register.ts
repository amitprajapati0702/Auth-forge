"use client";

import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { registeruser } from "@/lib/api/auth-api";
import { toast } from "sonner";

/**
 * Mutation hook for user registration.
 *
 * NOTE: Success toast is intentionally omitted here.
 * The consuming form component controls all user-facing feedback
 * to avoid duplicate toasts and to show richer contextual messages.
 */
export function useRegister() {
  return useMutation({
    mutationFn: registeruser,
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? "Registration failed")
        : "Registration failed";
      toast.error(message);
    },
  });
}
