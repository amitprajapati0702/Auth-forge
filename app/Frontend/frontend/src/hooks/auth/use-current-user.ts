"use client"
import { useQuery } from "@tanstack/react-query"
import { getCurrentUser } from "@/lib/api/auth-api"


export function useCurrentUser() {
    return useQuery({
        queryKey: ["current-user"],
        queryFn: getCurrentUser,
        retry: false,
        staleTime: 60000,
    });
}