"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSessionsApi,
  deleteSessionApi,
  logoutAllSessionsApi,
} from "@/lib/api/auth-api";
import type { Session } from "@/types/user";

export function useSessions() {
  return useQuery<Session[]>({
    queryKey: ["sessions"],
    queryFn: () => getSessionsApi(),
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useDeleteSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => deleteSessionApi(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
}

export function useLogoutAllSessions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => logoutAllSessionsApi(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
}
