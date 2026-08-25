import { api } from "./client";
import type { PaginatedUsersResponse, User, AuditLog, UserRole, UserStatus } from "@/types/user";

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}

export async function getUsers(params?: GetUsersParams): Promise<PaginatedUsersResponse> {
  const { data } = await api.get<{
    success: boolean;
    message: string;
    data: PaginatedUsersResponse;
  }>("/users", { params });

  return data.data;
}

export async function getUserById(id: string): Promise<User> {
  const { data } = await api.get<{
    success: boolean;
    data: User;
  }>(`/users/${id}`);

  return data.data;
}

export async function updateUserRole(id: string, role: UserRole): Promise<User> {
  const { data } = await api.patch<{
    success: boolean;
    message: string;
    data: User;
  }>(`/users/${id}/role`, { role });

  return data.data;
}

export async function updateUserStatus(id: string, status: UserStatus): Promise<User> {
  const { data } = await api.patch<{
    success: boolean;
    message: string;
    data: User;
  }>(`/users/${id}/status`, { status });

  return data.data;
}

export async function deleteUser(id: string): Promise<void> {
  await api.delete<{
    success: boolean;
    message: string;
  }>(`/users/${id}`);
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  const { data } = await api.get<{
    success: boolean;
    message: string;
    data: AuditLog[];
  }>("/users/audit-logs");

  return data.data;
}

export async function changePassword(data: { currentPassword: string; newPassword: string }): Promise<void> {
  await api.post("/users/change-password", data);
}

export async function updateProfile(data: { fullName?: string; email?: string }): Promise<User> {
  const { data: res } = await api.patch<{ success: boolean; data: User }>("/users/profile", data);
  return res.data;
}

