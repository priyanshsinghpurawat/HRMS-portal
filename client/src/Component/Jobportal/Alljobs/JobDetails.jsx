import React, { useState, useEffect } from 'react';
import {
  useParams,
  useNavigate,
  useLocation
} from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  MapPin,
  DollarSign,
  Briefcase,
  Clock,
  Building2,
  CalendarDays,
  Users,
  CheckCircle2,
  Bookmark,
  BookmarkCheck,
  Share2,
  Globe,
  Zap,
  GraduationCap,
  Award,
  Loader2,
  AlertCircle,
  AlertTriangle
} from 'lucide-react';
import ApplyModal from './ApplyModal';
import { useUserProfile } from '../../Context/UserProfileContext';

const BASE_URL = window.API_BASE_URL;

const getUserToken = () => Cookies.get("jobdekho_token") || null;

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    profileData,
    profileLoading,
    profileFetched,
    isProfileComplete,
    missingSections,
    completionPercentage,
    fetchUserProfile,
    // ==================== BUG FIX: Use API-backed check ====================
    checkIfJobApplied,
    markJobAsApplied,
    myApplications,        // NEW: Use API-fetched applications
    myApplicationsLoading,
    fetchMyApplications,   // NEW: Force refresh
    getCurrentUserId       // NEW: For debugging
  } = useUserProfile();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);

  // ==================== BUG FIX: Check application status from API, not localStorage ====================
  useEffect(() => {
    fetchJobDetails();
    checkSavedStatus();
    
    // Check if already applied using API-backed method (user-specific)
    const checkApplied = async () => {
      setCheckingStatus(true);
      try {
        // Ensure applications are loaded
        if (myApplications.length === 0 && !myApplicationsLoading) {
          await fetchMyApplications();
        }
        // Now check using the context function (which checks API first, then localStorage)
        const isApplied = checkIfJobApplied(id);
        setHasApplied(isApplied);
      } catch (error) {
      } finally {
        setCheckingStatus(false);
      }
    };

    if (getUserToken()) {
      checkApplied();
    } else {
      setHasApplied(false);
      setCheckingStatus(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]); // Only re-run when job ID changes

  // ==================== BUG FIX: Re-check when myApplications updates ====================
  useEffect(() => {
    if (getUserToken() && id) {
      const isApplied = checkIfJobApplied(id);
      setHasApplied(isApplied);
    }
  }, [myApplications, id, checkIfJobApplied]);

  const fetchJobDetails = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${BASE_URL}/jobs/${id}/public`);
      setJob(data.data);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load job details', { position: 'top-center' });
    } finally {
      setLoading(false);
    }
  };

  const checkSavedStatus = () => {
    const saved = JSON.parse(localStorage.getItem('savedJobs') || '[]');
    setIsSaved(saved.includes(id));
  };

  // ==================== BUG FIX: Removed old localStorage-based checkApplicationStatus ====================
  // The checkIfJobApplied from context now handles this properly with user-specific data

  const toggleSave = () => {
    const saved = JSON.parse(localStorage.getItem('savedJobs') || '[]');
    const newSaved = isSaved ? saved.filter(jId => jId !== id) : [...saved, id];
    localStorage.setItem('savedJobs', JSON.stringify(newSaved));
    setIsSaved(!isSaved);
    toast.success(isSaved ? 'Job removed from saved' : 'Job saved successfully', {
      position: 'bottom-center', duration: 2000
    });
  };

  const handleApplyClick = async () => {
    const token = getUserToken();

    // Step 1: Check Login
    if (!token) {
      toast.error("Please login to apply for jobs");
      navigate("/login", {
        state: { from: location.pathname, message: "Please login to apply for this job" },
      });
      return;
    }

    // ==================== BUG FIX: Check using context function (user-specific) ====================
    if (hasApplied || checkIfJobApplied(id)) {
      toast.error("You have already applied for this job");
      return;
    }

    // Step 3: Ensure profile is loaded

    if (profileLoading) {
      toast.loading('Loading your profile...');
      let attempts = 0;
      while (profileLoading && attempts < 50) {
        await new Promise(r => setTimeout(r, 100));
        attempts++;
      }
      toast.dismiss();
    }

    if (!profileFetched || !profileData) {
      toast.loading('Loading your profile...');
      const result = await fetchUserProfile();
      toast.dismiss();

      if (!result.success) {
        toast.error('Failed to load profile. Please try again.');
        return;
      }
    }

    // Step 4: Check Profile Complete
    const backendSaysComplete = profileData?.isProfileCompleted === true;
    
    if (!isProfileComplete && !backendSaysComplete) {
      toast.error(
        `Please complete your profile before applying (${completionPercentage}% complete)`,
        { duration: 4000 }
      );
      navigate("/u-profile", {
        state: {
          from: location.pathname,
          missingFields: missingSections,
          message: "Please complete your profile to apply for jobs",
          completionPercentage,
        },
      });
      return;
    }

    setShowApplyModal(true);
  };

  const handleApplySuccess = () => {
    setHasApplied(true);
    markJobAsApplied(id); // This now stores with user-specific key
    toast.success("Application submitted successfully!");
  };

  const handleAlreadyApplied = () => {
    setHasApplied(true);
    markJobAsApplied(id); // This now stores with user-specific key
    toast('You have already applied for this job', { icon: 'ℹ️', duration: 3000 });
  };

  // ... rest of component unchanged (formatSalary, formatDate, render) ...

  const formatSalary = (min, max) => {
    if (!min && !max) return 'Not disclosed';
    const format = (val) => val >= 100000 ? `${(val/100000).toFixed(0)}L` : `${(val/1000).toFixed(0)}K`;
    return `₹${format(min)} - ₹${format(max)} per annum`;
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const token = getUserToken();
  const showProfileLoading = token && profileLoading && !profileFetched;

  if (loading || showProfileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-orange-50/20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">
            {showProfileLoading ? 'Loading your profile...' : 'Loading job details...'}
          </p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-orange-50/20 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Job not found</h2>
          <p className="text-gray-500 mb-6">This job posting may have been removed or expired.</p>
          <button onClick={() => navigate('/jobs')}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-200">
            Browse All Jobs
          </button>
        </div>
      </div>
    );
  }

  const isRemote = job.location?.toLowerCase().includes('remote');

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-orange-50/20 pb-24">
      <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-md border-b border-orange-100 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate('/jobportal/alljobs')}
              className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors font-medium">
              <ArrowLeft className="w-5 h-5" /> Back to Jobs
            </button>
            <div className="flex items-center gap-2">
              <button onClick={toggleSave}
                className="p-2.5 rounded-xl bg-gray-50 hover:bg-orange-50 transition-colors">
                {isSaved ? <BookmarkCheck className="w-5 h-5 text-orange-500" /> : <Bookmark className="w-5 h-5 text-gray-400 hover:text-orange-500 transition-colors" />}
              </button>
              <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!', { position: 'bottom-center' }); }}
                className="p-2.5 rounded-xl bg-gray-50 hover:bg-orange-50 transition-colors">
                <Share2 className="w-5 h-5 text-gray-400 hover:text-orange-500 transition-colors" />
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Profile Warning Banner */}
        {profileFetched && !isProfileComplete && profileData?.isProfileCompleted !== true && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-center gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800">
                Your profile is {completionPercentage}% complete. Missing: {missingSections.join(', ')}
              </p>
            </div>
            <button
              onClick={() => navigate('/u-profile', { state: { from: location.pathname, missingFields: missingSections } })}
              className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-200 transition-colors"
            >
              Complete Profile
            </button>
          </motion.div>
        )}

        {/* Hero Card */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          className="bg-white rounded-3xl shadow-xl shadow-orange-100/30 border border-orange-50 overflow-hidden mb-8">
          <div className="h-2 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600" />
          <div className="p-6 sm:p-10">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <motion.div whileHover={{ scale: 1.05, rotate: 5 }}
                className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-orange-200 flex-shrink-0">
                {job.company?.name?.charAt(0).toUpperCase() || job.title?.charAt(0).toUpperCase() || 'J'}
              </motion.div>

              <div className="flex-1">
                <div className="flex flex-wrap items-start gap-3 mb-3">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{job.title}</h1>
                  {job.isFeatured && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200">
                      <Zap className="w-3 h-3" /> Featured
                    </span>
                  )}
                  {isRemote && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                      <Globe className="w-3 h-3" /> Remote
                    </span>
                  )}
                </div>

                <p className="text-lg text-gray-600 mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-gray-400" />
                  {job.company?.name || 'JobDekho'}
                </p>

                <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6">
                  <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-gray-400" />{job.location}</span>
                  <span className="flex items-center gap-1.5"><DollarSign className="w-4 h-4 text-gray-400" />{formatSalary(job.salaryMin, job.salaryMax)}</span>
                  <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-gray-400" />{job.experienceLevel?.charAt(0).toUpperCase() + job.experienceLevel?.slice(1)}</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-gray-400" />{job.employmentType?.replace('-', ' ')}</span>
                  <span className="flex items-center gap-1.5"><CalendarDays className="w-4 h-4 text-gray-400" />Posted {formatDate(job.createdAt)}</span>
                  <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-gray-400" />{job.openings} {job.openings === 1 ? 'opening' : 'openings'}</span>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {job.skills?.map((skill) => (
                    <span key={skill} className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-sm font-medium border border-orange-200">{skill}</span>
                  ))}
                </div>

                <div className="flex gap-3">
                  {/* ==================== BUG FIX: Use hasApplied state which is now user-specific ==================== */}
                  {hasApplied ? (
                    <button disabled
                      className="px-8 py-3.5 rounded-xl font-bold text-green-700 bg-green-50 border-2 border-green-200 flex items-center gap-2 cursor-default">
                      <CheckCircle2 className="w-5 h-5" /> Applied
                    </button>
                  ) : checkingStatus || myApplicationsLoading ? (
                    <button disabled
                      className="px-8 py-3.5 rounded-xl font-bold text-gray-500 bg-gray-100 border-2 border-gray-200 flex items-center gap-2 cursor-default">
                      <Loader2 className="w-5 h-5 animate-spin" /> Checking...
                    </button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleApplyClick}
                      className="px-8 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-200 flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-5 h-5" />Apply Now
                    </motion.button>
                  )}
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={toggleSave}
                    className={`px-6 py-3.5 rounded-xl font-semibold border-2 transition-all flex items-center gap-2 ${
                      isSaved ? 'border-orange-500 text-orange-600 bg-orange-50' : 'border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-600'
                    }`}>
                    {isSaved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                    {isSaved ? 'Saved' : 'Save Job'}
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ... rest of the component unchanged ... */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg shadow-orange-100/20 border border-orange-50 p-6 sm:p-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-orange-500" />Job Description
              </h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{job.description}</p>
            </motion.div>

            {job.responsibilities && job.responsibilities.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-lg shadow-orange-100/20 border border-orange-50 p-6 sm:p-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-orange-500" />Responsibilities
                </h2>
                <ul className="space-y-3">
                  {job.responsibilities.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4 text-orange-500" />
                      </div>
                      <span className="text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {job.benefits && job.benefits.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-lg shadow-orange-100/20 border border-orange-50 p-6 sm:p-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-orange-500" />Benefits & Perks
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {job.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                        <Award className="w-4 h-4 text-orange-500" />
                      </div>
                      <span className="text-gray-700 font-medium text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg shadow-orange-100/20 border border-orange-50 p-6">
              <h3 className="font-bold text-gray-800 mb-4">Job Overview</h3>
              <div className="space-y-4">
                {[
                  { label: 'Department', value: job.department, icon: Building2 },
                  { label: 'Employment Type', value: job.employmentType?.replace('-', ' '), icon: Briefcase },
                  { label: 'Experience Level', value: job.experienceLevel?.charAt(0).toUpperCase() + job.experienceLevel?.slice(1), icon: GraduationCap },
                  { label: 'Salary Range', value: formatSalary(job.salaryMin, job.salaryMax), icon: DollarSign },
                  { label: 'Location', value: job.location, icon: MapPin },
                  { label: 'Openings', value: `${job.openings} position${job.openings !== 1 ? 's' : ''}`, icon: Users },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-medium">{item.label}</p>
                        <p className="text-sm font-semibold text-gray-800">{item.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-lg shadow-orange-100/20 border border-orange-50 p-6">
              <h3 className="font-bold text-gray-800 mb-4">Skills Required</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills?.map((skill) => (
                  <span key={skill} className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-sm font-medium border border-orange-200">{skill}</span>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-xl">
                  {job.company?.name?.charAt(0).toUpperCase() || 'J'}
                </div>
                <div>
                  <h3 className="font-bold">{job.company?.name || 'JobDekho'}</h3>
                  <p className="text-sm text-orange-100">Hiring now</p>
                </div>
              </div>
              <p className="text-sm text-orange-100 leading-relaxed mb-4">
                Join our team and be part of something amazing. We offer competitive salaries and great benefits.
              </p>
              {/* ==================== BUG FIX: Use hasApplied state ==================== */}
              {hasApplied ? (
                <button disabled className="w-full py-3 bg-white/20 text-white rounded-xl font-bold cursor-default flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5" /> Already Applied
                </button>
              ) : (
                <button onClick={handleApplyClick}
                  className="w-full py-3 bg-white text-orange-600 rounded-xl font-bold hover:bg-orange-50 transition-colors">
                  Apply Now
                </button>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      <ApplyModal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        jobId={id}
        jobTitle={job?.title}
        onSuccess={handleApplySuccess}
        onAlreadyApplied={handleAlreadyApplied}
      />
    </div>
  );
};

export default JobDetails;