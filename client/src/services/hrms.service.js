import { apiGet, apiPost, apiPostPublic } from "./api";

const getToken = () => sessionStorage.getItem("companyToken");

const buildHrmsHeaders = (isFormData = false) => {
  const token = getToken();
  const headers = { Accept: "application/json" };
  if (!isFormData) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

const hrmsFetch = async (path, options = {}) => {
  const API_BASE = import.meta.env.VITE_API_URL || window.API_BASE_URL;
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...buildHrmsHeaders(), ...options.headers },
    credentials: "include",
  });
  const text = await response.text();
  try {
    return { response, data: JSON.parse(text) };
  } catch {
    return { response, data: { success: false, message: "Invalid server response" } };
  }
};

export const loginCompanyApi = async (credentials) => {
  const API_BASE = import.meta.env.VITE_API_URL || window.API_BASE_URL;
  try {
    const response = await fetch(`${API_BASE}/company/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      credentials: "include",
      body: JSON.stringify(credentials),
    });
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { success: false, message: "Server error" }; }

    if (!response.ok && (
      data?.message?.includes("Role") ||
      data?.message?.includes("not found") ||
      data?.message?.includes("Unauthorized")
    )) {
      const authResponse = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        credentials: "include",
        body: JSON.stringify(credentials),
      });
      const authText = await authResponse.text();
      let authData;
      try { authData = JSON.parse(authText); } catch { authData = { success: false }; }

      if (authResponse.ok && authData?.success) {
        const user = authData?.data?.user || {};
        if (user.role === "hr" || user.role === "employee") {
          return { response: authResponse, data: authData };
        }
        return { response: { ok: false, status: 403 }, data: { message: "Job seekers must use Job Portal" } };
      }
      return { response: authResponse, data: authData };
    }

    return { response, data };
  } catch {
    return { response: { ok: false, status: 500 }, data: { message: "Network error" } };
  }
};

export const checkCompanyAuthApi = async () => {
  const savedUser = sessionStorage.getItem("companyUser");
  const token = getToken();
  if (!savedUser || !token) return { response: { ok: false, status: 401 }, data: null };
  try {
    const parsed = JSON.parse(savedUser);
    if (!["company", "hr", "employee"].includes(parsed?.role)) {
      return { response: { ok: false, status: 403 }, data: null };
    }
    return { response: { ok: true, status: 200 }, data: { data: { user: parsed } } };
  } catch {
    return { response: { ok: false, status: 500 }, data: null };
  }
};

export const logoutCompanyApi = async () => {
  try {
    const API_BASE = import.meta.env.VITE_API_URL || window.API_BASE_URL;
    const token = getToken();
    await fetch(`${API_BASE}/company/logout`, {
      method: "POST",
      headers: { Accept: "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
      credentials: "include",
    }).catch(() => {});
    sessionStorage.removeItem("companyToken");
    sessionStorage.removeItem("companyUser");
    return true;
  } catch {
    sessionStorage.removeItem("companyToken");
    sessionStorage.removeItem("companyUser");
    return false;
  }
};

export const registerCompanyApi = async (payload) => {
  return apiPostPublic("/company/register", payload);
};

export const verifyCompanyEmailApi = async (email, otp) => {
  const API_BASE = import.meta.env.VITE_API_URL || window.API_BASE_URL;
  try {
    const response = await fetch(`${API_BASE}/company/verify-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { success: false, message: "Server error" }; }
    return { response, data };
  } catch {
    return { response: { ok: false }, data: { message: "Network error" } };
  }
};

export const resendCompanyOtpApi = async (email) => {
  const API_BASE = import.meta.env.VITE_API_URL || window.API_BASE_URL;
  try {
    const response = await fetch(`${API_BASE}/company/resend-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email }),
    });
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { success: false, message: "Server error" }; }
    return { response, data };
  } catch {
    return { response: { ok: false }, data: { message: "Network error" } };
  }
};

export const createHrApi = async (formData) => {
  return hrmsFetch("/company/hr", {
    method: "POST",
    body: JSON.stringify(formData),
  });
};
