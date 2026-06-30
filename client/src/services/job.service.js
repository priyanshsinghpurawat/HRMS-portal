import { apiGet, apiPost } from "./api";
import { getAuthToken } from "./api";

const API_BASE = import.meta.env.VITE_API_URL || window.API_BASE_URL;

export const getJobsApi = async (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val && val !== "All") query.set(key, val);
  });
  const qs = query.toString();
  return apiGet(`/jobs${qs ? `?${qs}` : ""}`);
};

export const getJobByIdApi = (id) => apiGet(`/jobs/${id}`);
export const getJobSuggestionsApi = (id) => apiGet(`/jobs/${id}/suggestions`);
export const applyToJobApi = (id, payload) => apiPost(`/jobs/${id}/apply`, payload);

export const getMyApplicationsApi = async () => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE}/applications/my-applications`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const text = await response.text();
  try {
    return { response, data: JSON.parse(text) };
  } catch {
    return { response, data: { success: false, message: "Invalid response" } };
  }
};
