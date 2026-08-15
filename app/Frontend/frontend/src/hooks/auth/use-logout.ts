"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logoutuser } from "@/lib/api/auth-api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
    onError: (error) => {
      // Even if network fails, reset client session
      queryClient.clear();
      const message =
        error instanceof Error ? error.message : "Session ended";
      toast.error(message);
      router.push("/login");
    },
  });
}
