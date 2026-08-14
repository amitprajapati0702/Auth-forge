import { api } from "./client";
import type { LoginInput, RegisterInput, VerifyEmailInput } from "../validation/auth";

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

export const loginuser = async(data:LoginInput) => {
    const res = await api.post("/auth/login",data)
    return res.data
}

export const getCurrentUser = async() => {
    const res = await api.get("/auth/me")
    return res.data.data
}

export const logoutuser = async()=>{
   return await api.post("/auth/logout")
}

export const refreshSession = async() => {
   const res = await api.post("/auth/refresh")

   return res.data
}
