import Cookies from "js-cookie";

const BASE_URL = window.API_BASE_URL;

const getUserToken = () => Cookies.get("jobdekho_token");

// Helper: Parse response safely
const safeJsonParse = async (response) => {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("Server returned HTML:", text.substring(0, 200));
    return { success: false, message: "Server error", htmlError: true };
  }
};

// Helper: Build headers with auth
const getAuthHeaders = (isFormData = false) => {
  const token = getUserToken();
  const headers = {
    Accept: "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }
  return headers;
};

// ==========================
// GET PROFILE
// ==========================
export const getProfileApi = async () => {
  try {
    const response = await fetch(`${BASE_URL}/profile`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const data = await safeJsonParse(response);
    return { response, data };
  } catch (error) {
    console.error("Get Profile Error:", error);
    return {
      response: { ok: false, status: 500 },
      data: { message: "Network error. Please check your connection." },
    };
  }
};

// ==========================
// UPDATE PROFILE (PUT)
// ==========================
export const updateProfileApi = async (payload) => {
  try {
    const response = await fetch(`${BASE_URL}/profile`, {
      method: "PUT",
      headers: getAuthHeaders(false),
      body: JSON.stringify(payload),
    });
    const data = await safeJsonParse(response);
    return { response, data };
  } catch (error) {
    console.error("Update Profile Error:", error);
    return {
      response: { ok: false, status: 500 },
      data: { message: "Network error. Please check your connection." },
    };
  }
};

// ==========================
// UPLOAD PROFILE IMAGE
// ==========================
export const uploadProfileImageApi = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append("profileImage", imageFile);
    const response = await fetch(`${BASE_URL}/profile/image`, {
      method: "PUT",
      headers: getAuthHeaders(true),
      body: formData,
    });
    const data = await safeJsonParse(response);
    return { response, data };
  } catch (error) {
    console.error("Upload Image Error:", error);
    return {
      response: { ok: false, status: 500 },
      data: { message: "Network error during image upload." },
    };
  }
};

// ==========================
// DELETE PROFILE IMAGE
// ==========================
export const deleteProfileImageApi = async () => {
  try {
    const response = await fetch(`${BASE_URL}/profile/image`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    const data = await safeJsonParse(response);
    return { response, data };
  } catch (error) {
    console.error("Delete Image Error:", error);
    return {
      response: { ok: false, status: 500 },
      data: { message: "Network error during image deletion." },
    };
  }
};

// ==========================
// UPLOAD RESUME
// ==========================
export const uploadResumeApi = async (resumeFile) => {
  try {
    const formData = new FormData();
    formData.append("resume", resumeFile);
    const response = await fetch(`${BASE_URL}/profile/resume`, {
      method: "PUT",
      headers: getAuthHeaders(true),
      body: formData,
    });
    const data = await safeJsonParse(response);
    return { response, data };
  } catch (error) {
    console.error("Upload Resume Error:", error);
    return {
      response: { ok: false, status: 500 },
      data: { message: "Network error during resume upload." },
    };
  }
};

// ==========================
// DELETE RESUME
// ==========================
export const deleteResumeApi = async () => {
  try {
    const response = await fetch(`${BASE_URL}/profile/resume`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    const data = await safeJsonParse(response);
    return { response, data };
  } catch (error) {
    console.error("Delete Resume Error:", error);
    return {
      response: { ok: false, status: 500 },
      data: { message: "Network error during resume deletion." },
    };
  }
};

// ==========================
// EDUCATION APIs
// ==========================
export const getEducationApi = async () => {
  try {
    const response = await fetch(`${BASE_URL}/education`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const data = await safeJsonParse(response);
    return { response, data };
  } catch (error) {
    console.error("Get Education Error:", error);
    return { response: { ok: false, status: 500 }, data: { data: [] } };
  }
};

export const addEducationApi = async (payload) => {
  try {
    const response = await fetch(`${BASE_URL}/education/create`, {
      method: "POST",
      headers: getAuthHeaders(false),
      body: JSON.stringify(payload),
    });
    const data = await safeJsonParse(response);
    return { response, data };
  } catch (error) {
    console.error("Add Education Error:", error);
    return { response: { ok: false, status: 500 }, data: { message: "Network error" } };
  }
};

export const updateEducationApi = async (id, payload) => {
  try {
    const response = await fetch(`${BASE_URL}/education/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(false),
      body: JSON.stringify(payload),
    });
    const data = await safeJsonParse(response);
    return { response, data };
  } catch (error) {
    console.error("Update Education Error:", error);
    return { response: { ok: false, status: 500 }, data: { message: "Network error" } };
  }
};

export const deleteEducationApi = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/education/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    const data = await safeJsonParse(response);
    return { response, data };
  } catch (error) {
    console.error("Delete Education Error:", error);
    return { response: { ok: false, status: 500 }, data: { message: "Network error" } };
  }
};

// ==========================
// EXPERIENCE APIs
// ==========================
export const getExperienceApi = async () => {
  try {
    const response = await fetch(`${BASE_URL}/experience`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const data = await safeJsonParse(response);
    return { response, data };
  } catch (error) {
    console.error("Get Experience Error:", error);
    return { response: { ok: false, status: 500 }, data: { data: [] } };
  }
};

export const addExperienceApi = async (payload) => {
  try {
    const response = await fetch(`${BASE_URL}/experience/create`, {
      method: "POST",
      headers: getAuthHeaders(false),
      body: JSON.stringify(payload),
    });
    const data = await safeJsonParse(response);
    return { response, data };
  } catch (error) {
    console.error("Add Experience Error:", error);
    return { response: { ok: false, status: 500 }, data: { message: "Network error" } };
  }
};

export const updateExperienceApi = async (id, payload) => {
  try {
    const response = await fetch(`${BASE_URL}/experience/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(false),
      body: JSON.stringify(payload),
    });
    const data = await safeJsonParse(response);
    return { response, data };
  } catch (error) {
    console.error("Update Experience Error:", error);
    return { response: { ok: false, status: 500 }, data: { message: "Network error" } };
  }
};

export const deleteExperienceApi = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/experience/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    const data = await safeJsonParse(response);
    return { response, data };
  } catch (error) {
    console.error("Delete Experience Error:", error);
    return { response: { ok: false, status: 500 }, data: { message: "Network error" } };
  }
};

// ==========================
// CERTIFICATION APIs
// ==========================
export const getCertificationApi = async () => {
  try {
    const response = await fetch(`${BASE_URL}/certificates`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const data = await safeJsonParse(response);
    return { response, data };
  } catch (error) {
    console.error("Get Certification Error:", error);
    return { response: { ok: false, status: 500 }, data: { data: [] } };
  }
};

export const addCertificationApi = async (formData) => {
  try {
    const response = await fetch(`${BASE_URL}/certificates`, {
      method: "POST",
      headers: getAuthHeaders(true),
      body: formData,
    });
    const data = await safeJsonParse(response);
    return { response, data };
  } catch (error) {
    console.error("Add Certification Error:", error);
    return { response: { ok: false, status: 500 }, data: { message: "Network error" } };
  }
};

export const updateCertificationApi = async (id, formData) => {
  try {
    const response = await fetch(`${BASE_URL}/certificates/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(true),
      body: formData,
    });
    const data = await safeJsonParse(response);
    return { response, data };
  } catch (error) {
    console.error("Update Certification Error:", error);
    return { response: { ok: false, status: 500 }, data: { message: "Network error" } };
  }
};

export const deleteCertificationApi = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/certificates/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    const data = await safeJsonParse(response);
    return { response, data };
  } catch (error) {
    console.error("Delete Certification Error:", error);
    return { response: { ok: false, status: 500 }, data: { message: "Network error" } };
  }
};