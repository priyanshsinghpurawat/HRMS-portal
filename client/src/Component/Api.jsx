import Cookies from "js-cookie";

// ==========================
// BASE URLS
// ==========================
const AUTH_BASE_URL = window.API_BASE_URL + "/auth";
const PROFILE_BASE_URL = window.API_BASE_URL + "/profile";
const RESUME_BASE_URL = window.API_BASE_URL + "/profile/resume";
const EXPERIENCE_BASE_URL = window.API_BASE_URL + "/experience";
const EDUCATION_BASE_URL = window.API_BASE_URL + "/education";
const CERTIFICATION_BASE_URL = window.API_BASE_URL + "/certificates";

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  return { response, data };
};

// ==========================
// HEADER HELPERS
// ==========================
const getAuthHeaders = () => {
  const token = Cookies.get("jobdekho_token");
  return {
    "Content-Type": "application/json",
    "Accept": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const getFormDataHeaders = () => {
  const token = Cookies.get("jobdekho_token");
  return {
    "Accept": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// ==========================
// AUTH API
// ==========================
export const checkAuthApi = async () => {
  const token = Cookies.get("jobdekho_token");
  
  // Prevent unnecessary API call if no token
  if (!token) {
    return { response: { ok: false, status: 401 }, data: null };
  }

  const response = await fetch(`${AUTH_BASE_URL}/me`, {
    method: "GET",
    headers: getAuthHeaders(),
    // credentials: "include", // Uncomment if backend uses HttpOnly cookies
  });
  return handleResponse(response);
};

export const loginApi = async (credentials) => {
  const response = await fetch(`${AUTH_BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify(credentials),
  });
  return handleResponse(response);
};

export const registerApi = async (formData) => {
  const response = await fetch(`${AUTH_BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify({ ...formData, role: formData.role || "user" }),
  });
  return handleResponse(response);
};

export const googleLoginApi = async (token) => {
  const response = await fetch(`${AUTH_BASE_URL}/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify({ token }),
  });
  return handleResponse(response);
};

export const logoutApi = async () => {
  const response = await fetch(`${AUTH_BASE_URL}/logout`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  return response;
};

// ==========================
// PROFILE API
// ==========================
export const getProfileApi = async () => {
  const response = await fetch(PROFILE_BASE_URL, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const updateProfileApi = async (profileData) => {
  const response = await fetch(PROFILE_BASE_URL, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(profileData),
  });
  return handleResponse(response);
};

export const updateProfileImageApi = async (imageFile) => {
  const formData = new FormData();
  formData.append("profileImage", imageFile);

  const response = await fetch(`${PROFILE_BASE_URL}/image`, {
    method: "PUT",
    headers: getFormDataHeaders(),
    body: formData,
  });
  return handleResponse(response);
};

export const deleteProfileImageApi = async () => {
  const response = await fetch(`${PROFILE_BASE_URL}/image`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

// ==========================
// RESUME API
// ==========================
export const updateResumeApi = async (resumeFile) => {
  const formData = new FormData();
  formData.append("resume", resumeFile);

  const response = await fetch(RESUME_BASE_URL, {
    method: "PUT",
    headers: getFormDataHeaders(),
    body: formData,
  });
  return handleResponse(response);
};

export const deleteResumeApi = async () => {
  const response = await fetch(RESUME_BASE_URL, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

// ==========================
// EXPERIENCE API
// ==========================
const makeExperiencePayload = (experienceData) => ({
  company: experienceData.company?.trim(),
  title: experienceData.title?.trim(),
  experienceLevel: experienceData.experienceLevel || "fresher",
  startDate: experienceData.startDate,
  endDate: experienceData.currentlyWorking ? null : experienceData.endDate,
  currentlyWorking: Boolean(experienceData.currentlyWorking),
  description: experienceData.description?.trim(),
});

export const getExperienceApi = async () => {
  const response = await fetch(EXPERIENCE_BASE_URL, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const addExperienceApi = async (experienceData) => {
  const response = await fetch(EXPERIENCE_BASE_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(makeExperiencePayload(experienceData)),
  });
  return handleResponse(response);
};

export const updateExperienceApi = async (id, experienceData) => {
  const response = await fetch(`${EXPERIENCE_BASE_URL}/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(makeExperiencePayload(experienceData)),
  });
  return handleResponse(response);
};

export const deleteExperienceApi = async (id) => {
  const response = await fetch(`${EXPERIENCE_BASE_URL}/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

// ==========================
// EDUCATION API
// ==========================
export const getEducationApi = async () => {
  const response = await fetch(EDUCATION_BASE_URL, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const addEducationApi = async (educationData) => {
  const response = await fetch(`${EDUCATION_BASE_URL}/create`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(educationData),
  });
  return handleResponse(response);
};

export const updateEducationApi = async (id, educationData) => {
  const response = await fetch(`${EDUCATION_BASE_URL}/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(educationData),
  });
  return handleResponse(response);
};

export const deleteEducationApi = async (id) => {
  const response = await fetch(`${EDUCATION_BASE_URL}/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

// ==========================
// CERTIFICATION API
// ==========================
export const getCertificationApi = async () => {
  const response = await fetch(CERTIFICATION_BASE_URL, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const addCertificationApi = async (formData) => {
  const response = await fetch(CERTIFICATION_BASE_URL, {
    method: "POST",
    headers: getFormDataHeaders(),
    body: formData,
  });
  return handleResponse(response);
};

export const updateCertificationApi = async (id, formData) => {
  const response = await fetch(`${CERTIFICATION_BASE_URL}/${id}`, {
    method: "PUT",
    headers: getFormDataHeaders(),
    body: formData,
  });
  return handleResponse(response);
};

export const deleteCertificationApi = async (id) => {
  const response = await fetch(`${CERTIFICATION_BASE_URL}/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};