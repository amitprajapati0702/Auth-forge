"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logoutuser } from "@/lib/api/auth-api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: logoutuser,
    onSuccess: () => {
      queryClient.clear();
      toast.success("Logged out successfully");
      router.push("/login");
    },
    onError: (error: unknown) => {
      // Even if network fails, reset client session and redirect
      queryClient.clear();
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? "Logout failed")
        : "Session ended";
      toast.error(message);
      router.push("/login");
    },
  });
}
