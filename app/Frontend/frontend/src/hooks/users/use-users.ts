"use client";

import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getUsers, 
  getUserById, 
  updateUserRole, 
  updateUserStatus, 
  deleteUser, 
  getAuditLogs,
  type GetUsersParams 
} from "@/lib/api/users-api";
import type { UserRole, UserStatus } from "@/types/user";
import { toast } from "sonner";

export function useUsers(params?: GetUsersParams) {
  return useQuery({
    queryKey: ["admin-users", params],
    queryFn: () => getUsers(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ["admin-user", id],
    queryFn: () => getUserById(id),
    enabled: !!id,
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) =>
      updateUserRole(id, role),
    onSuccess: (updatedUser) => {
      toast.success(`Role updated to ${updatedUser.role} for ${updatedUser.fullName}`);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-user", updatedUser.id] });
      queryClient.invalidateQueries({ queryKey: ["admin-audit-logs"] });
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? "Failed to update user role")
        : "Failed to update user role";
      toast.error(message);
    },
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: UserStatus }) =>
      updateUserStatus(id, status),
    onSuccess: (updatedUser) => {
      const isSuspended = updatedUser.status === "SUSPENDED";
      if (isSuspended) {
        toast.warning(`Account for ${updatedUser.fullName} has been suspended and sessions revoked`);
      } else {
        toast.success(`Account for ${updatedUser.fullName} is now active`);
      }
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-user", updatedUser.id] });
      queryClient.invalidateQueries({ queryKey: ["admin-audit-logs"] });
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? "Failed to update user status")
        : "Failed to update user status";
      toast.error(message);
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      toast.success("User account deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-audit-logs"] });
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ?? "Failed to delete user")
        : "Failed to delete user";
      toast.error(message);
    },
  });
}

export function useAuditLogs() {
  return useQuery({
    queryKey: ["admin-audit-logs"],
    queryFn: getAuditLogs,
  });
}
