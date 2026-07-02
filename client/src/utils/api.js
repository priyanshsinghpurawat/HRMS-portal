// utils/api.js
const API_BASE = window.API_BASE_URL;
import toast from "react-hot-toast";

// ==========================
// TOKEN HELPERS
// ==========================
export const getToken = () => {
  return (
    sessionStorage.getItem("companyToken") ||
    localStorage.getItem("companyToken") ||
    sessionStorage.getItem("accessToken") ||
    localStorage.getItem("accessToken")
  );
};

export const clearAuth = () => {
  sessionStorage.removeItem("companyToken");
  sessionStorage.removeItem("companyUser");
  sessionStorage.removeItem("accessToken");

  localStorage.removeItem("companyToken");
  localStorage.removeItem("companyUser");
  localStorage.removeItem("accessToken");
};

export const getUser = () => {
  try {
    const user =
      sessionStorage.getItem("companyUser") ||
      localStorage.getItem("companyUser");

    return user ? JSON.parse(user) : null;
  } catch (error) {
    return null;
  }
};


// ==========================
// GLOBAL API ERROR HANDLER
// ==========================
export const handleApiError = (error, navigate = null) => {

  const status = error?.response?.status || error?.status;
  const message =
    error?.response?.data?.message ||
    error?.data?.message ||
    error?.message ||
    "Something went wrong";

  // Session expired / unauthorized
  if (
    status === 401 ||
    message.toLowerCase().includes("jwt expired") ||
    message.toLowerCase().includes("unauthorized") ||
    message.toLowerCase().includes("invalid token")
  ) {
    clearAuth();

    toast.error("Session expired. Please login again.");

    if (navigate) {
      navigate("/company-login");
    } else {
      window.location.href = "/company-login";
    }

    return;
  }

  // Generic error toast
  toast.error(message);

  return message;
};


// ==========================
// AUTH HEADERS
// ==========================
export function getAuthHeaders() {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

// ==========================
// SAFE FETCH WITH AUTH
// ==========================
export async function apiFetch(url, options = {}) {
  const fullUrl = url.startsWith("http")
    ? url
    : `${API_BASE}${url}`;

  const headers = {
    ...getAuthHeaders(),
    ...options.headers,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers,
      credentials: "include",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const text = await response.text();
    let data = null;

    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text.substring(0, 200) };
      }
    }

    // Handle expired token globally
    if (
      response.status === 401 ||
      data?.message?.toLowerCase()?.includes("jwt expired")
    ) {
      clearAuth();

      window.location.href = "/company-login";
    }

    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      data,
      raw: text,
    };
  } catch (err) {
    clearTimeout(timeoutId);

    if (err.name === "AbortError") {
      return {
        ok: false,
        status: 0,
        data: {
          message:
            "Request timed out. Server may be waking up.",
        },
      };
    }

    return {
      ok: false,
      status: 0,
      data: {
        message: err.message || "Network error",
      },
    };
  }
}

export default API_BASE;