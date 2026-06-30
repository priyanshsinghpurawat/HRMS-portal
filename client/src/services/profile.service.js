import { apiGet, apiPut, apiDelete } from "./api";

export const getProfileApi = () => apiGet("/profile");
export const updateProfileApi = (payload) => apiPut("/profile", payload);

export const uploadProfileImageApi = (file) => {
  const fd = new FormData();
  fd.append("profileImage", file);
  return apiPut("/profile/image", fd, true);
};

export const deleteProfileImageApi = () => apiDelete("/profile/image");

export const uploadResumeApi = (file) => {
  const fd = new FormData();
  fd.append("resume", file);
  return apiPut("/profile/resume", fd, true);
};

export const deleteResumeApi = () => apiDelete("/profile/resume");

export const getEducationApi = () => apiGet("/education");
export const addEducationApi = (payload) => apiPut("/education/create", payload);
export const updateEducationApi = (id, payload) => apiPut(`/education/${id}`, payload);
export const deleteEducationApi = (id) => apiDelete(`/education/${id}`);

export const getExperienceApi = () => apiGet("/experience");
export const addExperienceApi = (payload) => apiPut("/experience/create", payload);
export const updateExperienceApi = (id, payload) => apiPut(`/experience/${id}`, payload);
export const deleteExperienceApi = (id) => apiDelete(`/experience/${id}`);

export const getCertificationApi = () => apiGet("/certificates");
export const addCertificationApi = (formData) => apiPut("/certificates", formData, true);
export const updateCertificationApi = (id, formData) => apiPut(`/certificates/${id}`, formData, true);
export const deleteCertificationApi = (id) => apiDelete(`/certificates/${id}`);
