import axios from 'axios';

const BASE_URL =window.API_BASE_URL;

const jobApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000,
});

// Get all jobs with filters
export const getJobs = async (params = {}) => {
  const response = await jobApi.get('/jobs', { params });
  return response.data;
};

// Get single job details (public)
export const getJobDetails = async (id) => {
  const response = await jobApi.get(`/jobs/${id}/public`);
  return response.data;
};

// Get single job details (authenticated)
export const getJobDetailsAuth = async (id, token) => {
  const response = await jobApi.get(`/jobs/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export default jobApi;