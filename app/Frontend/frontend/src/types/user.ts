export type UserRole = "USER" | "ADMIN";
export type UserStatus = "ACTIVE" | "SUSPENDED";

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  status?: UserStatus;
  isEmailVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Session {
  sessionId: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  lastActivityAt: string;
  isCurrent: boolean;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  user?: User;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedUsersResponse {
  users: User[];
  pagination: PaginationMeta;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorEmail: string;
  action: string;
  targetUserId?: string;
  targetUserEmail?: string;
  ipAddress?: string;
  details?: string;
  createdAt: string;
}