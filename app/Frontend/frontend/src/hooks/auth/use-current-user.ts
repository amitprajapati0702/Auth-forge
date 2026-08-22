"use client"
import { useQuery } from "@tanstack/react-query"
import { getCurrentUser } from "@/lib/api/auth-api"


export function useCurrentUser() {
    return useQuery({
        queryKey: ["current-user"],
        queryFn: getCurrentUser,
        retry: false,
        staleTime: Infinity, // Session state is managed server-side; refetch only on explicit invalidation
    });
}