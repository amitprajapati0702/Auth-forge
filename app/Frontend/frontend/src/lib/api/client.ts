import axios from "axios";

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// Shared state outside the interceptor for concurrency handling
let refreshPromise: Promise<unknown> | null = null;

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Do not attempt refresh on auth endpoints or if already retried
        const isAuthEndpoint =
            originalRequest?.url?.includes("/auth/login") ||
            originalRequest?.url?.includes("/auth/refresh") ||
            originalRequest?.url?.includes("/auth/register") ||
            originalRequest?.url?.includes("/auth/logout") ||
            originalRequest?.url?.includes("/users/me") ||
            originalRequest?.url?.includes("/profile") ||
            originalRequest?.url?.includes("/change-password") ||
            originalRequest?.url?.includes("/reset-password");

        if (error.response?.status === 401 && !originalRequest?._retry && !isAuthEndpoint) {
            originalRequest._retry = true;

            try {
                // If a refresh is already in progress, wait for it; otherwise initiate one
                if (!refreshPromise) {
                    refreshPromise = api.post("/auth/refresh").finally(() => {
                        refreshPromise = null;
                    });
                }

                await refreshPromise;

                // Retry the original request with the fresh cookie/session
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh token expired or invalid
                if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
                    window.location.href = "/login";
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);
