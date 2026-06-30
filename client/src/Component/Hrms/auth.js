
const TOKEN_KEY = "companyToken";
const USER_KEY = "companyUser";

/**
 * Get JWT token from sessionStorage
 * @returns {string|null} The auth token or null
 */
export const getToken = () => sessionStorage.getItem(TOKEN_KEY);

/**
 * Get parsed user object from sessionStorage
 * @returns {object|null} The user object or null
 */
export const getUser = () => {
  const userStr = sessionStorage.getItem(USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

/**
 * Store auth token in sessionStorage
 * @param {string} token - JWT token
 */
export const setToken = (token) => {
  if (token) sessionStorage.setItem(TOKEN_KEY, token);
};

/**
 * Store user data in sessionStorage
 * @param {object} user - User object
 */
export const setUser = (user) => {
  if (user) sessionStorage.setItem(USER_KEY, JSON.stringify(user));
};

/**
 * Remove all auth data from sessionStorage
 */
export const clearAuth = () => {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return !!getToken() && !!getUser();
};

/**
 * Get user role
 * @returns {string|null}
 */
export const getUserRole = () => {
  const user = getUser();
  return user?.role || null;
};

/**
 * Redirect based on user role
 * @param {object} navigate - React Router navigate function
 * @param {string} fallback - Fallback route if no role
 */
export const redirectByRole = (navigate, fallback = "/hrms") => {
  const role = getUserRole();
  if (role === "company") navigate("/company-dashboard", { replace: true });
  else if (role === "hr") navigate("/hrdashboard", { replace: true });
  else if (role === "employee") navigate("/employeedashboard", { replace: true });
  else navigate(fallback, { replace: true });
};

/**
 * Handle session expiry - clear storage, show toast, redirect
 * @param {object} navigate - React Router navigate function
 * @param {object} toast - React Hot Toast toast object
 */
export const handleSessionExpiry = (navigate, toast) => {
  clearAuth();
  toast.error("Session expired. Please login again.", {
    duration: 4000,
    position: "top-center",
  });
  navigate("/company-login", { replace: true });
};

/**
 * Handle API error with automatic session expiry detection
 * @param {Error} error - Axios error object
 * @param {object} navigate - React Router navigate function
 * @param {object} toast - React Hot Toast toast object
 * @returns {boolean} True if session was expired, false otherwise
 */
export const handleApiError = (error, navigate, toast) => {
  const status = error?.response?.status;
  const message = (error?.response?.data?.message || "").toLowerCase();

  const isUnauthorized = status === 401;
  const isTokenExpired = 
    message.includes("jwt expired") || 
    message.includes("unauthorized") || 
    message.includes("invalid token") ||
    message.includes("token expired") ||
    message.includes("no token");

  if (isUnauthorized || isTokenExpired) {
    handleSessionExpiry(navigate, toast);
    return true; // Session was expired
  }

  return false; // Other error, not session expiry
};