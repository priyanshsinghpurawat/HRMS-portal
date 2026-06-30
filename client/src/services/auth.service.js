import { apiGet, apiPost, apiPostPublic } from "./api";

export const checkAuthApi = async () => {
  return apiGet("/auth/me");
};

export const loginApi = async (credentials) => {
  return apiPostPublic("/auth/login", credentials);
};

export const registerApi = async (formData) => {
  return apiPostPublic("/auth/register", { ...formData, role: formData.role || "user" });
};

export const logoutApi = async () => {
  return apiPost("/auth/logout", {});
};
