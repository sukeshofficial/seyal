import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const authApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true, // Required for cookies
});

// ─── Token Refresh Interceptor ───────────────────────────────────────────────
// When any request returns 401 (access token expired), silently call /auth/refresh
// to get a new access token via the refresh token cookie, then retry once.
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
    failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve()));
    failedQueue = [];
};

authApi.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // List of routes that should never trigger a token refresh on 401
        const AUTH_ROUTES = ["/auth/login", "/auth/signup", "/auth/logout", "/auth/forgot-password", "/auth/reset-password", "/auth/verify-otp", "/auth/verify-reset-otp"];
        const isAuthRoute = AUTH_ROUTES.some((route) => originalRequest?.url?.includes(route));

        // Only intercept 401 errors that haven't been retried yet and aren't auth routes
        if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
            if (isRefreshing) {
                // Queue subsequent requests while a refresh is in progress
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => authApi(originalRequest))
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                await axios.post(
                    `${API_BASE_URL}/auth/refresh`,
                    {},
                    { withCredentials: true }
                );
                processQueue(null);
                return authApi(originalRequest); // Retry original request
            } catch (refreshError) {
                processQueue(refreshError);
                // Broadcast that authentication is now invalid
                window.dispatchEvent(new Event("auth:unauthorized"));
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

// When auth becomes invalid (e.g. logout fires mid-refresh), flush the queue
// and reset the flag so subsequent requests don't hang indefinitely.
window.addEventListener("auth:unauthorized", () => {
    isRefreshing = false;
    processQueue(new Error("Session ended"));
    failedQueue = [];
});

/**
 * Signup User
 * @param {Object} data - { firstName, lastName, username, email, password, confirmPassword }
 * @returns {Promise} - Axios response
 */
export const signupUser = async (data) => {
    try {
        // Transform flat data to nested name object expected by backend
        const { firstName, lastName, ...rest } = data;
        const payload = {
            name: {
                first: firstName,
                last: lastName,
            },
            ...rest,
        };
        const response = await authApi.post("/auth/signup", payload);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Something went wrong" };
    }
};

/**
 * Get Current User (Session restore)
 * @returns {Promise}
 */
export const getMe = async () => {
    try {
        const response = await authApi.get("/auth/me");
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to fetch session" };
    }
};

/**
 * Logout User
 * @returns {Promise}
 */
export const logoutUser = async () => {
    try {
        const response = await authApi.post("/auth/logout");
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Logout failed" };
    }
};

export const loginUser = async (data) => {
    try {
        const response = await authApi.post("/auth/login", data);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Login failed" };
    }
};

export const verifyOtp = async (data) => {
    try {
        const response = await authApi.post("/auth/verify-otp", data);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Verification failed" };
    }
};

export const resendOtp = async (data) => {
    try {
        const response = await authApi.post("/auth/resend-otp", data);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to resend OTP" };
    }
};

export const forgotPassword = async (email) => {
    try {
        const response = await authApi.post("/auth/forgot-password", { email });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to request password reset" };
    }
};

export const resetPassword = async (data) => {
    try {
        const response = await authApi.post("/auth/reset-password", data);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to reset password" };
    }
};

export const verifyResetOtp = async (data) => {
    try {
        const response = await authApi.post("/auth/verify-reset-otp", data);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Invalid reset code" };
    }
};

export const getPublicAvatar = async (identifier) => {
    try {
        const response = await authApi.get(`/auth/avatar/${encodeURIComponent(identifier)}`);
        return response.data;
    } catch (error) {
        // Silently fail for avatar lookups to avoid distracting the user
        return { success: false, data: { avatarUrl: null } };
    }
};

/**
 * Upload Avatar to Cloudinary
 * @param {File} file - The file to upload
 * @returns {Promise} - Cloudinary URL
 */
export const uploadAvatar = async (file) => {
    try {
        const formData = new FormData();
        formData.append("avatar", file);

        const response = await authApi.post("/auth/upload-avatar", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Avatar upload failed" };
    }
};

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
