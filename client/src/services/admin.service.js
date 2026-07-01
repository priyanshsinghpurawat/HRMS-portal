import { apiGet, apiPost, apiPut, apiDelete } from "./api";

// Fetch all users
export const getAdminUsers = async () => {
    const { response, data } = await apiGet("/admin/users");
    if (!response.ok) throw new Error(data.message || "Failed to fetch users");
    return data.data;
};

// Fetch all HRs
export const getAdminHRs = async () => {
    const { response, data } = await apiGet("/admin/hrs");
    if (!response.ok) throw new Error(data.message || "Failed to fetch HRs");
    return data.data;
};

// Fetch all Companies
export const getAdminCompanies = async () => {
    const { response, data } = await apiGet("/admin/companies");
    if (!response.ok) throw new Error(data.message || "Failed to fetch companies");
    return data.data;
};

// Block a company
export const blockCompany = async (id, reason) => {
    const token = document.cookie.split("; ").find(row => row.startsWith("jobdekho_token="))?.split("=")[1];
    const API_BASE = import.meta.env.VITE_API_URL || window.API_BASE_URL;
    
    const response = await fetch(`${API_BASE}/admin/companies/block/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to block company");
    return data.data;
};

// Unblock a company
export const unblockCompany = async (id) => {
    const token = document.cookie.split("; ").find(row => row.startsWith("jobdekho_token="))?.split("=")[1];
    const API_BASE = import.meta.env.VITE_API_URL || window.API_BASE_URL;
    
    const response = await fetch(`${API_BASE}/admin/companies/unblock/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`
        }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to unblock company");
    return data.data;
};

// Delete a company
export const deleteCompany = async (id) => {
    const { response, data } = await apiDelete(`/admin/companies/${id}`);
    if (!response.ok) throw new Error(data.message || "Failed to delete company");
    return data.data;
};
