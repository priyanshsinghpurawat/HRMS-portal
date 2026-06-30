
import axios from "axios";
import { getToken, clearAuth } from "../../utils/api";
import toast from "react-hot-toast";

const BASE_URL = window.API_BASE_URL;

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  timeout: 30000, // 30 second timeout
});

// ==========================
// REQUEST INTERCEPTOR
// Automatically injects Bearer token from sessionStorage
// ==========================
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ==========================
// RESPONSE INTERCEPTOR
// Handles 401 errors and session expiry globally
// ==========================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const message = (error?.response?.data?.message || "").toLowerCase();

    // Check for session expiry conditions
    const isSessionExpired = 
      status === 401 ||
      message.includes("jwt expired") ||
      message.includes("unauthorized") ||
      message.includes("invalid token") ||
      message.includes("token expired") ||
      message.includes("no token") ||
      message.includes("session expired");

    if (isSessionExpired) {
      // Clear auth data
      clearAuth();

      // Show toast notification
      toast.error("Session expired. Please login again.", {
        duration: 4000,
        position: "top-center",
        id: "session-expired", // Prevent duplicate toasts
      });

      // Redirect to login (using window.location for global redirect)
      // Components can also handle this via their own navigate
      if (typeof window !== "undefined") {
        window.location.href = "/company-login";
      }
    }

    return Promise.reject(error);
  }
);

// ==========================
// API WRAPPER FUNCTIONS
// Reusable HTTP methods with built-in error handling
// ==========================

/**
 * GET request wrapper
 * @param {string} endpoint - API endpoint (without baseURL)
 * @param {object} params - Query parameters
 * @returns {Promise} Axios response
 */
export const get = (endpoint, params = {}) => api.get(endpoint, { params });

/**
 * POST request wrapper
 * @param {string} endpoint - API endpoint
 * @param {object} data - Request body
 * @returns {Promise} Axios response
 */
export const post = (endpoint, data = {}) => api.post(endpoint, data);

/**
 * PUT request wrapper
 * @param {string} endpoint - API endpoint
 * @param {object} data - Request body
 * @returns {Promise} Axios response
 */
export const put = (endpoint, data = {}) => api.put(endpoint, data);

/**
 * PATCH request wrapper
 * @param {string} endpoint - API endpoint
 * @param {object} data - Request body
 * @returns {Promise} Axios response
 */
export const patch = (endpoint, data = {}) => api.patch(endpoint, data);

/**
 * DELETE request wrapper
 * @param {string} endpoint - API endpoint
 * @returns {Promise} Axios response
 */
export const del = (endpoint) => api.delete(endpoint);

export default api;