// src/services/leaveApi.js
import api from "../../utils/api"; // Your project's existing axios instance

export const leaveApi = {
  // Employee endpoints
  // NOTE: Backend doesn't have /attendance/leaves/me
  // We use /attendance/leaves and filter by current user on frontend
  getMyLeaves: () => api.get('/attendance/leaves'),
  
  applyLeave: (payload) => api.post('/attendance/leave', payload),

  // HR endpoints
  getAllLeaves: () => api.get('/attendance/leaves'),
  updateLeaveStatus: (leaveId, payload) => api.put(`/attendance/leave/${leaveId}`, payload),
};

export default leaveApi;