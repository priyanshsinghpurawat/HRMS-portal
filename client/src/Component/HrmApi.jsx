const BASE_URL = window.API_BASE_URL;

// Token helpers
const getToken = () => sessionStorage.getItem("companyToken");
const setToken = (token) => {
  if (token) sessionStorage.setItem("companyToken", token);
  else sessionStorage.removeItem("companyToken");
};
const removeToken = () => {
  sessionStorage.removeItem("companyToken");
  sessionStorage.removeItem("companyUser");
};

const safeJsonParse = async (response) => {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    return { success: false, message: "Server error", htmlError: true };
  }
};

// ==========================
// UNIVERSAL LOGIN
// Backend only has /company/login and /auth/login
// Try /company/login first (for company, hr, employee)
// ==========================
// HrmApi.jsx — FIXED loginCompanyApi
export const loginCompanyApi = async (credentials) => {
  try {
    // 1. Try company login first
    const response = await fetch(`${BASE_URL}/company/login`, {
      method: "POST",
      headers: {
        "accept": "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(credentials),
    });

    const data = await safeJsonParse(response);

    // ✅ FIXED: Check for "Company not found" OR "Role" errors
    if (!response.ok && (
      data?.message?.includes("Role") ||
      data?.message?.includes("Company not found") ||
      data?.message?.includes("not found") ||
      data?.message?.includes("Unauthorized")
    )) {
      
      // 2. Try auth login (for HR and employee)
      const authResponse = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "accept": "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(credentials),
      });

      const authData = await safeJsonParse(authResponse);
      
      if (authResponse.ok && authData?.success) {
        const user = authData?.data?.user || {};
        
        // ✅ Only allow hr and employee roles from auth
        if (user.role === "hr" || user.role === "employee") {
          setToken(authData.data.accessToken);
          sessionStorage.setItem("companyUser", JSON.stringify(user));
          return { response: authResponse, data: authData };
        }
        
        // If user is regular "user" role, reject
        return {
          response: { ok: false, status: 403 },
          data: { message: "Job seekers must use Job Portal login" }
        };
      }
      
      // Return auth error if that also fails
      return { response: authResponse, data: authData };
    }

    // Store token if company login successful
    if (response.ok && data?.success) {
      const user = data?.data?.user || {};
      setToken(data.data.accessToken);
      sessionStorage.setItem("companyUser", JSON.stringify(user));
      return { response, data };
    }

    return { response, data };

  } catch (error) {
    return {
      response: { ok: false, status: 500 },
      data: { message: "Network error. Please check your connection." },
    };
  }
};

// ==========================
// CHECK HRMS AUTH — sessionStorage
// ==========================
export const checkCompanyAuthApi = async () => {
  const savedUser = sessionStorage.getItem("companyUser");
  const token = getToken();

  if (!savedUser || !token) {
    return { response: { ok: false, status: 401 }, data: null };
  }

  try {
    const parsedUser = JSON.parse(savedUser);
    if (!["company", "hr", "employee"].includes(parsedUser?.role)) {
      removeToken();
      return { response: { ok: false, status: 403 }, data: null };
    }
    return {
      response: { ok: true, status: 200 },
      data: { data: { user: parsedUser } },
    };
  } catch (e) {
    removeToken();
    return { response: { ok: false, status: 500 }, data: null };
  }
};

// ==========================
// HRMS LOGOUT
// ==========================
export const logoutCompanyApi = async () => {
  try {
    const token = getToken();
    await fetch(`${BASE_URL}/company/logout`, {
      method: "POST",
      headers: {
        "accept": "application/json",
        ...(token && { "Authorization": `Bearer ${token}` }),
      },
      credentials: "include",
    }).catch(() => {});
    removeToken();
    return true;
  } catch (error) {
    removeToken();
    return false;
  }
};

// ==========================
// COMPANY REGISTER
// ==========================
export const registerCompanyApi = async (payload) => {
  try {
    const response = await fetch(`${BASE_URL}/company/register`, {
      method: "POST",
      headers: {
        "accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await safeJsonParse(response);
    if (!response.ok) return { success: false, message: data?.message || "Registration failed" };
    return { success: true, ...data };
  } catch (error) {
    return { success: false, message: "Network error" };
  }
};

// ==========================
// VERIFY OTP
// ==========================
export const verifyCompanyEmailApi = async (email, otp) => {
  try {
    const response = await fetch(`${BASE_URL}/company/verify-email`, {
      method: "POST",
      headers: {
        "accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, otp }),
    });
    const data = await safeJsonParse(response);
    return { response, data };
  } catch (error) {
    return { response: { ok: false }, data: { message: "Network error" } };
  }
};

// ==========================
// RESEND OTP
// ==========================
export const resendCompanyOtpApi = async (email) => {
  try {
    const response = await fetch(`${BASE_URL}/company/resend-otp`, {
      method: "POST",
      headers: {
        "accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
    const data = await safeJsonParse(response);
    return { response, data };
  } catch (error) {
    return { response: { ok: false }, data: { message: "Network error" } };
  }
};

// ==========================
// CREATE HR
// ==========================
export const createHrApi = async (formData) => {
  try {
    const token = getToken();
    const response = await fetch(`${BASE_URL}/company/hr`, {
      method: "POST",
      headers: {
        "accept": "application/json",
        "Content-Type": "application/json",
        ...(token && { "Authorization": `Bearer ${token}` }),
      },
      credentials: "include",
      body: JSON.stringify(formData),
    });
    const data = await safeJsonParse(response);
    return { response, data };
  } catch (error) {
    return { response: { ok: false }, data: { message: "Network error" } };
  }
};