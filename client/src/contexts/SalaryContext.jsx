import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL || window.API_BASE_URL || "http://localhost:3000/api/v1").replace('/v1', '');

const SalaryContext = createContext();

export const useSalary = () => {
  const context = useContext(SalaryContext);
  if (!context) {
    throw new Error('useSalary must be used within a SalaryProvider');
  }
  return context;
};

export const SalaryProvider = ({ children }) => {
  const [salaries, setSalaries] = useState([]);
  const [currentSalary, setCurrentSalary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Fetch current salary for an employee
  const getCurrentSalary = async (employeeId, companyId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/salary/${employeeId}/current`,
        config
      );
      setCurrentSalary(response.data.data);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch current salary');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create initial salary structure
  const createSalary = async (employeeId, salaryData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/salary/${employeeId}`,
        salaryData,
        config
      );
      setSalaries(prev => [response.data.data, ...prev]);
      setCurrentSalary(response.data.data);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create salary');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create salary revision
  const createRevision = async (employeeId, revisionData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/salary/${employeeId}/revision`,
        revisionData,
        config
      );
      setSalaries(prev => [response.data.data, ...prev]);
      setCurrentSalary(response.data.data);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create revision');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get salary history
  const getSalaryHistory = async (employeeId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/salary/${employeeId}/history`,
        config
      );
      setSalaries(response.data.data);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch salary history');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get salary by date
  const getSalaryByDate = async (employeeId, targetDate) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/salary/${employeeId}/date/${targetDate}`,
        config
      );
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch salary by date');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  const value = {
    salaries,
    currentSalary,
    loading,
    error,
    getCurrentSalary,
    createSalary,
    createRevision,
    getSalaryHistory,
    getSalaryByDate,
    clearError,
  };

  return <SalaryContext.Provider value={value}>{children}</SalaryContext.Provider>;
};
