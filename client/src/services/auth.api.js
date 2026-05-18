import axios from "axios";

/* -------------------------------------------------------------------------- */
/*                                   Config                                   */
/* -------------------------------------------------------------------------- */

const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1",
  TIMEOUT: 15000,
  HEADERS: { "Content-Type": "application/json" },
  // Routes that should NOT trigger a token refresh loop on 401
  BYPASS_REFRESH_ROUTES: [
    "/auth/login",
    "/auth/signup",
    "/auth/logout",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/verify-otp",
    "/auth/verify-reset-otp",
  ],
  EVENTS: {
    UNAUTHORIZED: "auth:unauthorized",
  },
};

/* -------------------------------------------------------------------------- */
/*                               Helper Functions                             */
/* -------------------------------------------------------------------------- */

/**
 * Standardizes error extraction from Axios responses.
 */
const parseApiError = (error, fallbackMessage = "An unexpected error occurred") => {
  return error.response?.data || { message: fallbackMessage, success: false };
};

/**
 * Checks if the current request URL is in the refresh bypass list.
 */
const shouldBypassRefresh = (url) => {
  return API_CONFIG.BYPASS_REFRESH_ROUTES.some((route) => url?.includes(route));
};

/**
 * Dispatches a global event to notify the app (e.g., AuthProvider) to clear session.
 */
const broadcastUnauthorized = () => {
  window.dispatchEvent(new Event(API_CONFIG.EVENTS.UNAUTHORIZED));
};

/* -------------------------------------------------------------------------- */
/*                               Instance Setup                               */
/* -------------------------------------------------------------------------- */

const authApi = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
  withCredentials: true,
});

/* -------------------------------------------------------------------------- */
/*                            Refresh Interceptor                             */
/* -------------------------------------------------------------------------- */

let isRefreshing = false;
let failedQueue = [];

/**
 * Processes the list of waiting requests after a token refresh attempt.
 */
const processQueue = (error, token = null) => {
  failedQueue.forEach((promise) => {
    if (error) promise.reject(error);
    else promise.resolve(token);
  });
  failedQueue = [];
};

authApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Condition: 401 Error, not already retried, and not a bypass route
    const isUnauthorized = error.response?.status === 401;
    const isRetry = originalRequest._retry;
    const isBypass = shouldBypassRefresh(originalRequest.url);

    if (isUnauthorized && !isRetry && !isBypass) {
      if (isRefreshing) {
        // Queue the request until the current refresh cycle finishes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => authApi(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt silent refresh via HttpOnly Cookie
        await axios.post(`${API_CONFIG.BASE_URL}/auth/refresh`, {}, { withCredentials: true });
        
        processQueue(null);
        return authApi(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        broadcastUnauthorized();
        return Promise.reject(parseApiError(refreshError));
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(parseApiError(error));
  }
);

/* -------------------------------------------------------------------------- */
/*                               API Services                                 */
/* -------------------------------------------------------------------------- */

/**
 * Auth Lifecycle
 */
export const loginUser = async (credentials) => {
  const response = await authApi.post("/auth/login", credentials);
  return response.data;
};

export const signupUser = async (data) => {
  const { firstName, lastName, ...rest } = data;
  // Transform flat frontend data to nested backend structure
  const payload = {
    name: { first: firstName, last: lastName },
    ...rest,
  };
  const response = await authApi.post("/auth/signup", payload);
  return response.data;
};

export const getMe = async () => {
  const response = await authApi.get("/auth/me");
  return response.data;
};

export const logoutUser = async () => {
  const response = await authApi.post("/auth/logout");
  return response.data;
};

/**
 * OTP & Password Management
 */
export const verifyOtp = async (data) => {
  const response = await authApi.post("/auth/verify-otp", data);
  return response.data;
};

export const resendOtp = async (data) => {
  const response = await authApi.post("/auth/resend-otp", data);
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await authApi.post("/auth/forgot-password", { email });
  return response.data;
};

export const resetPassword = async (data) => {
  const response = await authApi.post("/auth/reset-password", data);
  return response.data;
};

export const verifyResetOtp = async (data) => {
  const response = await authApi.post("/auth/verify-reset-otp", data);
  return response.data;
};

/**
 * Assets & Profiles
 */
export const getPublicAvatar = async (identifier) => {
  try {
    const response = await authApi.get(`/auth/avatar/${encodeURIComponent(identifier)}`);
    return response.data;
  } catch (error) {
    // Graceful degradation for public assets
    return { success: false, data: { avatarUrl: null } };
  }
};

export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append("avatar", file);

  const response = await authApi.post("/auth/upload-avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// Listen for global logout events to flush any pending request queues
window.addEventListener(API_CONFIG.EVENTS.UNAUTHORIZED, () => {
  isRefreshing = false;
  processQueue(new Error("Session terminated"));
});

export default {
  signupUser,
  loginUser,
  getMe,
  logoutUser,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
  verifyResetOtp,
  getPublicAvatar,
  uploadAvatar,
};
