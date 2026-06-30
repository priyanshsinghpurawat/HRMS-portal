import Cookies from "js-cookie";

const API_BASE = import.meta.env.VITE_API_URL || window.API_BASE_URL;

const getAuthToken = () => Cookies.get("jobdekho_token") || null;

const buildHeaders = (isFormData = false) => {
  const token = getAuthToken();
  const headers = { Accept: "application/json" };
  if (!isFormData) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

const parseResponse = async (response) => {
  const text = await response.text();
  try {
    return { response, data: JSON.parse(text) };
  } catch {
    return { response, data: { success: false, message: "Invalid server response" } };
  }
};

export const apiGet = async (path) => {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    headers: buildHeaders(),
  });
  return parseResponse(response);
};

export const apiPost = async (path, body, isFormData = false) => {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: buildHeaders(isFormData),
    body: isFormData ? body : JSON.stringify(body),
  });
  return parseResponse(response);
};

export const apiPut = async (path, body, isFormData = false) => {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "PUT",
    headers: buildHeaders(isFormData),
    body: isFormData ? body : JSON.stringify(body),
  });
  return parseResponse(response);
};

export const apiDelete = async (path) => {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "DELETE",
    headers: buildHeaders(),
  });
  return parseResponse(response);
};

export const apiPostPublic = async (path, body) => {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  return parseResponse(response);
};

export { API_BASE, getAuthToken };
