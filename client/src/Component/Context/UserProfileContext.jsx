import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';
import { useAuth } from './AppContext';
import { getProfileApi } from '../Jobportal/Home/UserDetails/ProfileApi';

const UserProfileContext = createContext(null);
const BASE_URL = window.API_BASE_URL;

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error('useUserProfile must be used within UserProfileProvider');
  }
  return context;
};

// ==================== BUG FIX: USER-SPECIFIC LOCAL STORAGE ====================
const getUserSpecificKey = (userId) => {
  if (!userId) return null;
  return `jobdekho_applied_jobs_${userId}`;
};

const getAppliedJobs = (userId) => {
  if (!userId) return [];
  try {
    const stored = localStorage.getItem(getUserSpecificKey(userId));
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const storeAppliedJob = (jobId, userId) => {
  if (!userId || !jobId) return;
  try {
    const key = getUserSpecificKey(userId);
    const applied = getAppliedJobs(userId);
    if (!applied.includes(jobId)) {
      applied.push(jobId);
      localStorage.setItem(key, JSON.stringify(applied));
    }
  } catch (e) {
  }
};

const removeAppliedJob = (jobId, userId) => {
  if (!userId || !jobId) return;
  try {
    const key = getUserSpecificKey(userId);
    const applied = getAppliedJobs(userId).filter(id => id !== jobId);
    localStorage.setItem(key, JSON.stringify(applied));
  } catch (e) {
  }
};

const isJobApplied = (jobId, userId) => {
  if (!userId || !jobId) return false;
  return getAppliedJobs(userId).includes(jobId);
};

export const clearAllUserApplicationData = (userId) => {
  if (!userId) {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('jobdekho_applied_jobs_')) {
        localStorage.removeItem(key);
      }
    });
    return;
  }
  const key = getUserSpecificKey(userId);
  localStorage.removeItem(key);
};

const migrateOldAppliedJobs = (userId) => {
  if (!userId) return;
  try {
    const oldData = localStorage.getItem('jobdekho_applied_jobs');
    if (oldData) {
      localStorage.removeItem('jobdekho_applied_jobs');
    }
  } catch (e) {
  }
};

export const checkProfileSectionComplete = (profileData) => {
  if (!profileData) {
    return {
      isComplete: false,
      missing: ['personalDetails', 'education', 'experience', 'skills', 'certifications', 'resume', 'profileImage'],
      present: [],
      completionPercentage: 0,
      totalSections: 7,
      completedSections: 0,
    };
  }

  if (profileData.isProfileCompleted === true) {
    return {
      isComplete: true,
      missing: [],
      present: ['personalDetails', 'education', 'experience', 'skills', 'certifications', 'resume', 'profileImage'],
      completionPercentage: 100,
      totalSections: 7,
      completedSections: 7,
    };
  }

  const missing = [];
  const present = [];
  const user = profileData?.user || {};
  
  const hasName = !!(user?.name || profileData?.title || profileData?.userName);
  const hasEmail = !!(user?.email);
  const hasLocation = !!(profileData?.location || user?.location || profileData?.currentLocation);
  const hasPersonal = hasName && hasEmail && hasLocation;
  
  if (!hasPersonal) missing.push('personalDetails');
  else present.push('personalDetails');

  const education = profileData?.education || [];
  if (!Array.isArray(education) || education.length === 0) missing.push('education');
  else present.push('education');

  const experience = profileData?.experience || [];
  if (!Array.isArray(experience) || experience.length === 0) missing.push('experience');
  else present.push('experience');

  const skills = profileData?.skills || [];
  if (!Array.isArray(skills) || skills.length === 0) missing.push('skills');
  else present.push('skills');

  const certifications = profileData?.certifications || [];
  if (!Array.isArray(certifications) || certifications.length === 0) missing.push('certifications');
  else present.push('certifications');

  const hasResume = !!(profileData?.resume?.url || profileData?.resume?.public_id || profileData?.resume);
  if (!hasResume) missing.push('resume');
  else present.push('resume');

  const hasProfileImage = !!(profileData?.profileImage?.url || profileData?.profileImage?.public_id || profileData?.profileImage);
  if (!hasProfileImage) missing.push('profileImage');
  else present.push('profileImage');

  const totalSections = 7;
  const completionPercentage = Math.round((present.length / totalSections) * 100);

  return {
    isComplete: missing.length === 0,
    missing,
    present,
    completionPercentage,
    totalSections,
    completedSections: present.length,
  };
};

export const UserProfileProvider = ({ children }) => {
  const { isAuthenticated, user, profileFetchTrigger, logout } = useAuth();
  
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [profileFetched, setProfileFetched] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [myApplicationsLoading, setMyApplicationsLoading] = useState(false);
  const [applicationsFetched, setApplicationsFetched] = useState(false); // NEW: Track if apps were fetched
  
  const hasFetchedRef = useRef(false);
  const previousUserIdRef = useRef(null);
  const applicationsFetchRef = useRef(false); // NEW: Prevent duplicate fetches

  const getAuthToken = useCallback(() => Cookies.get('jobdekho_token') || null, []);

  const getCurrentUserId = useCallback(() => {
    return user?._id || user?.id || profileData?.user?._id || profileData?.user?.id || null;
  }, [user, profileData]);

  // ==================== BUG FIX: RESET STATE ON USER CHANGE ====================
  useEffect(() => {
    const currentUserId = getCurrentUserId();
    
    if (previousUserIdRef.current !== currentUserId) {
      
      setProfileData(null);
      setProfileFetched(false);
      setProfileError(null);
      setAppliedJobs([]);
      setMyApplications([]);
      setApplicationsFetched(false); // NEW: Reset fetch flag
      applicationsFetchRef.current = false; // NEW: Reset ref
      hasFetchedRef.current = false;
      
      migrateOldAppliedJobs(currentUserId);
      
      if (currentUserId) {
        setAppliedJobs(getAppliedJobs(currentUserId));
      }
      
      previousUserIdRef.current = currentUserId;
    }
  }, [getCurrentUserId]);

  const fetchUserProfile = useCallback(async (showToast = false, force = false) => {
    const token = getAuthToken();
    if (!token) {
      setProfileData(null);
      setProfileFetched(false);
      hasFetchedRef.current = false;
      return { success: false, message: 'No auth token' };
    }

    if (hasFetchedRef.current && !force) {
      return { success: true, data: profileData };
    }

    setProfileLoading(true);
    setProfileError(null);

    try {
      const profileRes = await getProfileApi();
      
      if (!profileRes.response.ok) {
        throw new Error(profileRes.data?.message || 'Failed to load profile');
      }

      const baseProfile = profileRes.data?.data || {};
      
      setProfileData(baseProfile);
      setProfileFetched(true);
      hasFetchedRef.current = true;
      setProfileError(null);

      const userId = baseProfile.user?._id || baseProfile.user?.id;
      if (userId) {
        setAppliedJobs(getAppliedJobs(userId));
      }

      if (showToast) toast.success('Profile loaded successfully');
      return { success: true, data: baseProfile };
    } catch (error) {
      setProfileError(error.message || 'Network error');
      setProfileFetched(true);
      hasFetchedRef.current = true;
      return { success: false, message: error.message || 'Network error' };
    } finally {
      setProfileLoading(false);
    }
  }, [getAuthToken, profileData]);

  // ==================== NEW: FETCH MY APPLICATIONS FROM API ====================
  const fetchMyApplications = useCallback(async (force = false) => {
    const token = getAuthToken();
    const userId = getCurrentUserId();
    
    if (!token || !userId) {
      setMyApplications([]);
      return { success: false, message: 'Not authenticated' };
    }

    // Prevent duplicate fetches unless forced
    if (!force && applicationsFetchRef.current) {
      return { success: true, data: myApplications };
    }

    setMyApplicationsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/applications/my-applications`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data?.message || 'Failed to fetch applications');
      }

      const applications = data.data || data.applications || [];
      setMyApplications(applications);
      setApplicationsFetched(true); // NEW: Mark as fetched
      applicationsFetchRef.current = true; // NEW: Mark ref
      
      // Sync localStorage with API response
      const jobIds = applications.map(app => app.jobId || app.job?._id || app.jobId);
      const currentStored = getAppliedJobs(userId);
      
      jobIds.forEach(jobId => {
        if (jobId && !currentStored.includes(jobId)) {
          storeAppliedJob(jobId, userId);
        }
      });
      
      const validJobIds = new Set(jobIds);
      const cleanedStored = currentStored.filter(id => validJobIds.has(id));
      if (cleanedStored.length !== currentStored.length) {
        localStorage.setItem(getUserSpecificKey(userId), JSON.stringify(cleanedStored));
      }
      
      setAppliedJobs(getAppliedJobs(userId));
      
      return { success: true, data: applications };
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setMyApplicationsLoading(false);
    }
  }, [getAuthToken, getCurrentUserId, myApplications, applicationsFetched]);

  const updateProfileSection = useCallback((section, data) => {
    setProfileData(prev => {
      if (!prev) return { [section]: data };
      return { ...prev, [section]: data };
    });
  }, []);

  const markJobAsApplied = useCallback((jobId) => {
    const userId = getCurrentUserId();
    if (!userId) {
      return;
    }
    storeAppliedJob(jobId, userId);
    setAppliedJobs(getAppliedJobs(userId));
  }, [getCurrentUserId]);

  const checkIfJobApplied = useCallback((jobId) => {
    const userId = getCurrentUserId();
    if (!userId) return false;
    
    const apiApplied = myApplications.some(app => 
      (app.jobId || app.job?._id || app.jobId) === jobId
    );
    if (apiApplied) return true;
    
    return isJobApplied(jobId, userId);
  }, [getCurrentUserId, myApplications]);

  const unmarkJobAsApplied = useCallback((jobId) => {
    const userId = getCurrentUserId();
    if (!userId) return;
    removeAppliedJob(jobId, userId);
    setAppliedJobs(getAppliedJobs(userId));
  }, [getCurrentUserId]);

  const clearUserData = useCallback(() => {
    const userId = getCurrentUserId();
    if (userId) {
      clearAllUserApplicationData(userId);
    }
    setProfileData(null);
    setProfileFetched(false);
    setProfileError(null);
    setAppliedJobs([]);
    setMyApplications([]);
    setApplicationsFetched(false);
    applicationsFetchRef.current = false;
    hasFetchedRef.current = false;
    previousUserIdRef.current = null;
  }, [getCurrentUserId]);

  // Initial profile fetch
  useEffect(() => {
    const token = getAuthToken();
    if (token && !hasFetchedRef.current) fetchUserProfile(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch profile when auth trigger changes
  useEffect(() => {
    if (isAuthenticated && profileFetchTrigger > 0 && !hasFetchedRef.current) {
      fetchUserProfile(false);
    }
  }, [isAuthenticated, profileFetchTrigger, fetchUserProfile]);

  // ==================== BUG FIX: AUTO-FETCH APPLICATIONS WHEN PROFILE IS READY ====================
  useEffect(() => {
    const userId = getCurrentUserId();
    
    if (isAuthenticated && userId && profileFetched && !applicationsFetched && !myApplicationsLoading) {
      fetchMyApplications();
    }
  }, [isAuthenticated, getCurrentUserId, profileFetched, applicationsFetched, myApplicationsLoading, fetchMyApplications]);

  const refreshProfile = useCallback(async () => {
    hasFetchedRef.current = false;
    return await fetchUserProfile(true, true);
  }, [fetchUserProfile]);

  const clearProfile = useCallback(() => {
    clearUserData();
  }, [clearUserData]);

  const profileCheck = profileData ? checkProfileSectionComplete(profileData) : {
    isComplete: false,
    missing: ['personalDetails', 'education', 'experience', 'skills', 'certifications', 'resume', 'profileImage'],
    present: [],
    completionPercentage: 0,
    totalSections: 7,
    completedSections: 0,
  };

  const value = {
    profileData,
    profileLoading,
    profileError,
    profileFetched,
    profileCheck,
    isProfileComplete: profileCheck.isComplete,
    missingSections: profileCheck.missing,
    completionPercentage: profileCheck.completionPercentage,
    fetchUserProfile,
    refreshProfile,
    updateProfileSection,
    clearProfile,
    personalDetails: profileData?.user || profileData || {},
    education: profileData?.education || [],
    experience: profileData?.experience || [],
    skills: profileData?.skills || [],
    certifications: profileData?.certifications || [],
    resume: profileData?.resume || null,
    profileImage: profileData?.profileImage || null,
    
    appliedJobs,
    myApplications,
    myApplicationsLoading,
    applicationsFetched, // NEW: Expose fetch status
    fetchMyApplications,
    markJobAsApplied,
    checkIfJobApplied,
    unmarkJobAsApplied,
    clearUserData,
    getCurrentUserId,
  };

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
};

export default UserProfileContext;