// Extend Axios config to support the _retry flag used in the refresh interceptor
declare module "axios" {
  interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

import { api } from "./client";
import type {
  LoginInput,
  RegisterInput,
  VerifyEmailInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "../validation/auth";
import type { User, Session, LoginResponse } from "@/types/user";

export const registeruser = async (data: RegisterInput) => {
  const res = await api.post("/auth/register", data);
  return res.data;
};

export const verifyEmailApi = async (data: VerifyEmailInput) => {
  const res = await api.post("/auth/verify-email", data);
  return res.data;
};

export const resendOtpApi = async (email: string) => {
  const res = await api.post("/auth/resend-otp", { email });
  return res.data;
};

export const loginuser = async (data: LoginInput): Promise<LoginResponse> => {
  const res = await api.post<LoginResponse>("/auth/login", data);
  return res.data;
};

export const forgotPasswordApi = async (data: ForgotPasswordInput) => {
  const res = await api.post("/auth/forgot-password", data);
  return res.data;
};

export const resetPasswordApi = async (data: Pick<ResetPasswordInput, "token" | "newPassword">) => {
  const res = await api.post("/auth/reset-password", data);
  return res.data;
};

export const getCurrentUser = async (): Promise<User> => {
  const res = await api.get<{ success: boolean; data: User }>("/auth/me");
  return res.data.data;
};

export const logoutuser = async (): Promise<void> => {
  await api.post("/auth/logout");
};

export const logoutAllSessionsApi = async (): Promise<void> => {
  await api.post("/auth/logout-all");
};

export const refreshSession = async () => {
  const res = await api.post("/auth/refresh");
  return res.data;
};

// Sessions APIs
export const getSessionsApi = async (): Promise<Session[]> => {
  const res = await api.get<{ success: boolean; data: Session[] }>("/sessions");
  return res.data.data;
};

export const deleteSessionApi = async (sessionId: string): Promise<void> => {
  await api.delete(`/sessions/${sessionId}`);
};
