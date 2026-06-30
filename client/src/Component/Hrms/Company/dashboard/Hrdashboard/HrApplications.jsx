import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Users, Briefcase, Mail, Phone, MapPin, FileText, Calendar,
  CheckCircle2, XCircle, Clock, Loader2, Search, Filter, ChevronDown, ChevronUp,
  Eye, GraduationCap, Award, User, BrainCircuit, ListChecks, PauseCircle, Send, Handshake, Ban,
  UserCheck, CalendarCheck, ClipboardCheck, Building2, DollarSign, ExternalLink,
  Download, Globe, X, Link2, BookOpen, Layers
} from 'lucide-react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';

const BASE_URL = window.API_BASE_URL;

const getUserToken = () => Cookies.get("jobdekho_token") || sessionStorage.getItem("companyToken") || sessionStorage.getItem("employeeToken") || sessionStorage.getItem("accessToken") || null;

// ==================== Status Badge Component ====================
const StatusBadge = ({ status }) => {
  const normalized = (status || 'APPLIED').toLowerCase();

  const STATUS_MAP = {
    applied: { style: 'bg-gray-50 text-gray-700 border-gray-200', icon: <Clock className="w-3.5 h-3.5" />, label: 'Applied' },
    ai_screened: { style: 'bg-purple-50 text-purple-700 border-purple-200', icon: <BrainCircuit className="w-3.5 h-3.5" />, label: 'AI Screened' },
    shortlist_queue: { style: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: <ListChecks className="w-3.5 h-3.5" />, label: 'Shortlist Queue' },
    hold_queue: { style: 'bg-amber-50 text-amber-700 border-amber-200', icon: <PauseCircle className="w-3.5 h-3.5" />, label: 'On Hold' },
    under_hr_review: { style: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: <Eye className="w-3.5 h-3.5" />, label: 'Under HR Review' },
    shortlisted: { style: 'bg-sky-50 text-sky-700 border-sky-200', icon: <UserCheck className="w-3.5 h-3.5" />, label: 'Shortlisted' },
    interview_scheduled: { style: 'bg-blue-50 text-blue-700 border-blue-200', icon: <CalendarCheck className="w-3.5 h-3.5" />, label: 'Interview Scheduled' },
    interview_completed: { style: 'bg-cyan-50 text-cyan-700 border-cyan-200', icon: <ClipboardCheck className="w-3.5 h-3.5" />, label: 'Interview Completed' },
    selected: { style: 'bg-teal-50 text-teal-700 border-teal-200', icon: <CheckCircle2 className="w-3.5 h-3.5" />, label: 'Selected' },
    offer_sent: { style: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <Send className="w-3.5 h-3.5" />, label: 'Offer Sent' },
    offer_accepted: { style: 'bg-green-50 text-green-700 border-green-200', icon: <Handshake className="w-3.5 h-3.5" />, label: 'Offer Accepted' },
    hired: { style: 'bg-lime-50 text-lime-700 border-lime-200', icon: <Award className="w-3.5 h-3.5" />, label: 'Hired' },
    not_selected: { style: 'bg-red-50 text-red-700 border-red-200', icon: <Ban className="w-3.5 h-3.5" />, label: 'Not Selected' },
  };

  const config = STATUS_MAP[normalized] || STATUS_MAP.applied;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.style}`}>
      {config.icon}
      {config.label}
    </span>
  );
};

// ==================== InfoCard Sub-component ====================
const InfoCard = ({ icon: Icon, label, value }) => (
  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
    <div className="flex items-center gap-2 mb-1">
      <Icon className="w-4 h-4 text-orange-500" />
      <span className="text-xs text-gray-400">{label}</span>
    </div>
    <p className="text-sm font-medium text-gray-800 truncate">{value || 'N/A'}</p>
  </div>
);

// ==================== Applicant Detail Modal ====================
const ApplicantModal = ({ isOpen, onClose, application, onStatusChange }) => {
  if (!isOpen || !application) return null;

  const applicant = application?.applicant || application?.user || application?.candidate || {};
  const job = application?.job || {};

  // ==================== NEW: Fetch applicant profile for location ====================
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const applicantId = applicant?._id || applicant?.id;

  useEffect(() => {
    if (!isOpen || !applicantId) return;

    const fetchProfile = async () => {
      setProfileLoading(true);
      try {
        const token = getUserToken();
        // Try multiple possible endpoints for user profile
        const endpoints = [
          `${BASE_URL}/users/${applicantId}/profile`,
          `${BASE_URL}/profiles/${applicantId}`,
          `${BASE_URL}/user-profiles/${applicantId}`,
          `${BASE_URL}/users/profile/${applicantId}`,
        ];

        for (const endpoint of endpoints) {
          try {
            const res = await axios.get(endpoint, {
              headers: { Authorization: `Bearer ${token}` },
              timeout: 5000
            });
            if (res.data?.data) {
              setProfileData(res.data.data);
              setProfileLoading(false);
              return;
            }
          } catch (err) {
            // Try next endpoint
            continue;
          }
        }

        setProfileData(null);
      } catch (error) {
        // silent
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [isOpen, applicantId]);
  // ==================== END NEW ====================

  // ==================== UPDATED: Build location from profile or applicant ====================
  const getLocationString = () => {
    // First try profile data (fetched separately)
    const source = profileData || applicant;

    const parts = [];
    if (source?.address) parts.push(source.address);
    if (source?.city) parts.push(source.city);
    if (source?.state) parts.push(source.state);
    if (source?.country) parts.push(source.country);
    if (source?.pincode) parts.push(source.pincode);

    if (parts.length > 0) return parts.join(', ');

    // Fallback: nested location object
    if (source?.location) {
      const loc = source.location;
      const locParts = [];
      if (loc.address) locParts.push(loc.address);
      if (loc.city) locParts.push(loc.city);
      if (loc.state) locParts.push(loc.state);
      if (loc.country) locParts.push(loc.country);
      if (loc.pincode) locParts.push(loc.pincode);
      if (locParts.length > 0) return locParts.join(', ');
    }

    // Fallback: legacy locations field
    if (source?.locations) {
      if (Array.isArray(source.locations)) return source.locations.join(', ');
      if (typeof source.locations === 'string') return source.locations;
    }

    return 'N/A';
  };
  // ==================== END UPDATED ====================

  const resumeUrl = application?.resume || applicant?.resume?.url || applicant?.resume;
  const rawCoverLetter = application?.coverLetter || '';
  const coverLetter = typeof rawCoverLetter === 'string' ? rawCoverLetter : 'Cover letter format invalid.';
  const profileImage = applicant?.profileImage?.url || applicant?.avatar || applicant?.profileImage;
  const applicationDate = application?.appliedAt || application?.createdAt;

  const safeSkills = Array.isArray(applicant?.skills) ? applicant.skills : [];
  const safeExperience = Array.isArray(applicant?.experience) ? applicant.experience : [];
  const safeEducation = Array.isArray(applicant?.education) ? applicant.education : [];

  const formatDate = (date) => {
    if (!date) return 'N/A';
    try { return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }); }
    catch { return 'Invalid Date'; }
  };

  const socialLinks = [
    { icon: FaLinkedin, label: 'LinkedIn', url: applicant?.linkedin || applicant?.socialLinks?.linkedin },
    { icon: FaGithub, label: 'GitHub', url: applicant?.github || applicant?.socialLinks?.github },
    { icon: Globe, label: 'Portfolio', url: applicant?.portfolio || applicant?.socialLinks?.portfolio },
    { icon: Link2, label: 'Website', url: applicant?.website || applicant?.socialLinks?.website },
  ].filter(link => typeof link.url === 'string' && link.url.trim() !== '');

  const currentStatus = application?.internalStatus || application?.candidateStatus || application?.status || 'APPLIED';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto z-10"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
            <div className="flex items-center gap-4">
              {profileImage && typeof profileImage === 'string' ? (
                <img src={profileImage} alt={applicant?.name || applicant?.fullName || 'Candidate'} className="w-14 h-14 rounded-full object-cover border-2 border-orange-200" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-xl">
                  {(applicant?.name || applicant?.fullName || 'A').charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold text-gray-900">{applicant?.name || applicant?.fullName || 'Anonymous Candidate'}</h2>
                <p className="text-sm text-gray-500">{applicant?.email || 'No email provided'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={currentStatus} />
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Quick Info Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <InfoCard icon={Mail} label="Email" value={applicant?.email} />
              <InfoCard icon={Phone} label="Phone" value={applicant?.phone || applicant?.mobile} />
              {/* FIXED: Location now uses getLocationString() which reads from fetched profile or applicant */}
              <InfoCard icon={MapPin} label="Location" value={getLocationString()} />
              <InfoCard icon={Calendar} label="Applied On" value={formatDate(applicationDate)} />
            </div>

            {/* Status Update Section - IN MODAL */}
            <div className="bg-orange-50 rounded-xl p-5 border border-orange-100">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-orange-500" /> Update Application Status
              </h3>
              <div className="flex flex-wrap gap-2">
                {['APPLIED', 'AI_SCREENED', 'UNDER_HR_REVIEW', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED', 'SELECTED', 'OFFER_SENT', 'OFFER_ACCEPTED', 'HIRED', 'NOT_SELECTED'].map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      onStatusChange(application._id, status);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      currentStatus === status
                        ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-600'
                    }`}
                  >
                    {status.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {socialLinks.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-colors"
                  >
                    <link.icon className="w-4 h-4" /> {link.label}
                  </a>
                ))}
              </div>
            )}

            {/* Resume Section */}
            {resumeUrl && typeof resumeUrl === 'string' ? (
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-5 border border-orange-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Resume</p>
                      <p className="text-sm text-gray-500">PDF Document • Submitted with application</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2">
                      <ExternalLink className="w-4 h-4" /> View
                    </a>
                    <a href={resumeUrl} download className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors flex items-center gap-2">
                      <Download className="w-4 h-4" /> Download
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <p className="font-semibold text-gray-500">Resume not uploaded</p>
                  <p className="text-sm text-gray-400">This applicant has not uploaded a resume</p>
                </div>
              </div>
            )}

            {/* Cover Letter */}
            {coverLetter && (
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-orange-500" /> Cover Letter
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{coverLetter}</p>
              </div>
            )}

            {/* Skills */}
            {safeSkills.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4 text-orange-500" /> Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {safeSkills.map((skill, i) => (
                    <span key={i} className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-sm font-medium border border-orange-100">
                      {typeof skill === 'string' ? skill : 'Invalid Skill'}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            {safeExperience.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-orange-500" /> Work Experience
                </h3>
                <div className="space-y-3">
                  {safeExperience.map((exp, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-800">{exp?.title || exp?.role || 'Position'}</p>
                          <p className="text-sm text-gray-500">{exp?.company || exp?.organization || 'Company'}</p>
                        </div>
                        <span className="text-xs text-gray-400 bg-white px-2 py-1 rounded-md border border-gray-100">
                          {exp?.startDate ? new Date(exp.startDate).getFullYear() : ''} - {exp?.endDate ? new Date(exp.endDate).getFullYear() : 'Present'}
                        </span>
                      </div>
                      {exp?.description && typeof exp.description === 'string' && <p className="text-sm text-gray-600 mt-2">{exp.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {safeEducation.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-orange-500" /> Education
                </h3>
                <div className="space-y-3">
                  {safeEducation.map((edu, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <p className="font-semibold text-gray-800">{edu?.degree || edu?.title || 'Degree'}</p>
                      <p className="text-sm text-gray-500">{edu?.institution || edu?.school || edu?.university || 'Institution'}</p>
                      <p className="text-xs text-gray-400 mt-1">{edu?.startYear || edu?.startDate} - {edu?.endYear || edu?.endDate || 'Present'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Job Applied For */}
            <div className="bg-orange-50 rounded-xl p-5 border border-orange-100">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-orange-500" /> Applied For
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{job?.title || 'Position Role'}</p>
                    <p className="text-xs text-gray-500">{job?.department || 'Department'} • {job?.location || 'Location'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">₹{job?.salaryMin?.toLocaleString?.() || 'N/A'} - ₹{job?.salaryMax?.toLocaleString?.() || 'N/A'}</p>
                    <p className="text-xs text-gray-500">{job?.employmentType || 'Full-time'} • {job?.experienceLevel || 'Any'} Level</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// ==================== Main Component ====================
const HrApplications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedApp, setExpandedApp] = useState(null);
  const [modalApp, setModalApp] = useState(null);

  const stats = useMemo(() => {
    const total = applications.length;
    const pending = applications.filter(a => {
      const s = (a?.internalStatus || a?.candidateStatus || a?.status || 'APPLIED').toLowerCase();
      return ['applied', 'ai_screened', 'shortlist_queue', 'hold_queue', 'under_hr_review', 'pending'].includes(s);
    }).length;
    const accepted = applications.filter(a => {
      const s = (a?.internalStatus || a?.candidateStatus || a?.status || '').toLowerCase();
      return ['shortlisted', 'interview_scheduled', 'interview_completed', 'selected', 'offer_sent', 'offer_accepted', 'hired', 'accepted'].includes(s);
    }).length;
    const rejected = applications.filter(a => {
      const s = (a?.internalStatus || a?.candidateStatus || a?.status || '').toLowerCase();
      return ['not_selected', 'rejected'].includes(s);
    }).length;

    return { total, pending, accepted, rejected };
  }, [applications]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = getUserToken();
      if (!token) {
        toast.error("Please login as HR");
        navigate("/login");
        return;
      }

      const jobsRes = await axios.get(`${BASE_URL}/jobs/my-jobs`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const jobList = jobsRes.data?.data?.jobs || jobsRes.data?.data || [];
      setJobs(jobList);

      if (!Array.isArray(jobList) || jobList.length === 0) {
        setApplications([]);
        setLoading(false);
        return;
      }

      const appPromises = jobList.map(job => 
        axios.get(`${BASE_URL}/applications/hr/jobs/${job._id}/applications`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(err => {
          return null;
        })
      );

      const appResponses = await Promise.all(appPromises);

      let allApps = [];
      appResponses.forEach((res, index) => {
        if (res && res.data) {
          const apps = res.data?.data?.applications || res.data?.data || res.data?.applications || [];
          if (Array.isArray(apps)) {
            apps.forEach(a => {
              const currentJob = jobList[index];
              if (!currentJob) return;
              allApps.push({ 
                ...a, 
                job: currentJob,
                _jobId: currentJob._id
              });
            });
          }
        }
      });

      setApplications(allApps);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = useCallback(async (appId, newStatus) => {
    try {
      const token = getUserToken();
      const toastId = toast.loading('Updating status...');

      const response = await axios.patch(
        `${BASE_URL}/applications/hr/applications/${appId}/status`,
        { internalStatus: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`Status updated to ${newStatus.replace(/_/g, ' ')}`, { 
        id: toastId,
        icon: <CheckCircle2 className="w-5 h-5 text-green-500" />
      });

      setApplications(prevApps => {
        const updatedApps = prevApps.map(app => {
          if (app._id === appId) {
            return { 
              ...app, 
              internalStatus: newStatus, 
              candidateStatus: newStatus, 
              status: newStatus 
            };
          }
          return app;
        });
        return updatedApps;
      });

      setModalApp(prevModal => {
        if (prevModal && prevModal._id === appId) {
          return { 
            ...prevModal, 
            internalStatus: newStatus, 
            candidateStatus: newStatus, 
            status: newStatus 
          };
        }
        return prevModal;
      });

      setExpandedApp(prev => {
        if (prev === appId) {
          return appId;
        }
        return prev;
      });

    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to update status';

      if (error?.response?.status === 401) {
        toast.error('Session expired. Please login again');
        navigate('/login');
      } else {
        toast.error(message);
      }
    }
  }, [applications, navigate]);

  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const matchesJob = selectedJob === 'all' || app._jobId === selectedJob || app.job?._id === selectedJob;

      const s = (app?.internalStatus || app?.candidateStatus || app?.status || 'APPLIED').toLowerCase();
      let matchesStatus = true;

      if (statusFilter === 'pending') {
        matchesStatus = ['applied', 'ai_screened', 'shortlist_queue', 'hold_queue', 'under_hr_review', 'pending'].includes(s);
      } else if (statusFilter === 'accepted') {
        matchesStatus = ['shortlisted', 'interview_scheduled', 'interview_completed', 'selected', 'offer_sent', 'offer_accepted', 'hired', 'accepted'].includes(s);
      } else if (statusFilter === 'rejected') {
        matchesStatus = ['not_selected', 'rejected'].includes(s);
      }

      const applicant = app?.applicant || app?.user || app?.candidate || {};
      const applicantName = (applicant?.name || applicant?.fullName || '').toLowerCase();
      const applicantEmail = (applicant?.email || '').toLowerCase();
      const jobTitle = (app?.job?.title || '').toLowerCase();

      const matchesSearch = !searchQuery || 
        applicantName.includes(searchQuery.toLowerCase()) ||
        applicantEmail.includes(searchQuery.toLowerCase()) ||
        jobTitle.includes(searchQuery.toLowerCase());

      return matchesJob && matchesStatus && matchesSearch;
    });
  }, [applications, selectedJob, statusFilter, searchQuery]);

  const groupedApplications = useMemo(() => {
    const grouped = {};
    filteredApplications.forEach(app => {
      const jobId = app?._jobId || app?.job?._id;
      const jobTitle = app?.job?.title || 'Unknown Job';

      if (!jobId) return;

      if (!grouped[jobId]) {
        grouped[jobId] = { job: app.job || {}, title: jobTitle, applications: [] };
      }
      grouped[jobId].applications.push(app);
    });
    return grouped;
  }, [filteredApplications]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-orange-50/20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading applications for your jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-orange-50/20 pb-24">
      {/* Header */}
      <motion.nav 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-md border-b border-orange-100 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate('/hrdashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors font-medium"
            >
              <ArrowLeft className="w-5 h-5" /> Back to Dashboard
            </button>
            <h1 className="text-xl font-bold text-gray-800">Job Applications</h1>
            <div className="w-20" />
          </div>
        </div>
      </motion.nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Applications', value: stats.total, icon: Users, color: 'from-orange-500 to-orange-600' },
            { label: 'Pending Review', value: stats.pending, icon: Clock, color: 'from-amber-400 to-amber-600' },
            { label: 'Shortlisted', value: stats.accepted, icon: CheckCircle2, color: 'from-emerald-400 to-emerald-600' },
            { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'from-red-400 to-red-600' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg shadow-orange-100/20 border border-orange-50"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg shadow-orange-100/20 border border-orange-50 p-4 mb-6"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by applicant name, email, or job title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 text-sm"
              />
            </div>
            <div className="relative min-w-[200px]">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 text-sm appearance-none bg-white truncate"
              >
                <option value="all">All My Posted Jobs</option>
                {jobs.map(job => (
                  <option key={job._id} value={job._id}>{job.title}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative min-w-[150px]">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 text-sm appearance-none bg-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="accepted">Shortlisted</option>
                <option value="rejected">Rejected</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </motion.div>

        {/* Dynamic Groups Rendering */}
        <div className="space-y-8">
          {Object.keys(groupedApplications).length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl shadow-lg shadow-orange-100/20 border border-orange-50 p-12 text-center"
            >
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">No applications found</h3>
              <p className="text-gray-500">You haven't received any applications matching your selection.</p>
            </motion.div>
          ) : (
            Object.entries(groupedApplications).map(([jobId, group]) => (
              <motion.div key={jobId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="bg-white rounded-2xl shadow-lg shadow-orange-100/20 border border-orange-50 p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">{group.title}</h2>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> {group?.job?.department || 'N/A'}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {group?.job?.location || 'N/A'}</span>
                        <span className="flex items-center gap-1">Posted {group?.job?.createdAt ? new Date(group.job.createdAt).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </div>
                    <div>
                      <span className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-sm font-medium border border-orange-200">
                        {group.applications.length} Application{group.applications.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {group.applications.map((app, index) => {
                    const applicant = app?.applicant || app?.user || app?.candidate || {};
                    const applicantName = applicant?.name || applicant?.fullName || 'Anonymous Candidate';
                    const isExpanded = expandedApp === app?._id;

                    const appStatus = (app?.internalStatus || app?.candidateStatus || app?.status || 'APPLIED').toUpperCase();

                    const isRejected = appStatus === 'NOT_SELECTED' || appStatus === 'REJECTED';
                    const isShortlistedOrHigher = ['SHORTLISTED', 'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED', 'SELECTED', 'OFFER_SENT', 'OFFER_ACCEPTED', 'HIRED', 'ACCEPTED'].includes(appStatus);
                    const resumeUrl = app?.resume || applicant?.resume?.url || applicant?.resume;

                    return (
                      <motion.div
                        key={app?._id || index}
                        layout
                        className="bg-white rounded-2xl shadow-lg shadow-orange-100/20 border border-orange-50 overflow-hidden"
                      >
                        {/* Main Row */}
                        <div 
                          className="p-5 sm:p-6 cursor-pointer hover:bg-orange-50/30 transition-colors"
                          onClick={() => setExpandedApp(isExpanded ? null : app._id)}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-orange-200">
                              {applicantName.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <h3 className="font-bold text-gray-900">{applicantName}</h3>
                                <StatusBadge status={app?.internalStatus || app?.candidateStatus} />
                              </div>
                              <p className="text-sm text-gray-500 flex items-center gap-3 mt-1 flex-wrap">
                                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {applicant?.email || 'N/A'}</span>
                                <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {applicant?.phone || applicant?.mobile || 'N/A'}</span>
                              </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  setModalApp(app); 
                                }}
                                className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                title="View Full Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {resumeUrl && typeof resumeUrl === 'string' ? (
                                <a
                                  href={resumeUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="p-2 bg-gray-50 text-gray-600 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors"
                                  title="View Resume"
                                >
                                  <FileText className="w-4 h-4" />
                                </a>
                              ) : (
                                <span className="p-2 bg-gray-50 text-gray-300 rounded-lg cursor-not-allowed" title="No resume uploaded">
                                  <FileText className="w-4 h-4" />
                                </span>
                              )}

                              {!isShortlistedOrHigher && !isRejected && (
                                <button
                                  onClick={(e) => { 
                                    e.stopPropagation(); 
                                    updateStatus(app._id, 'SHORTLISTED'); 
                                  }}
                                  className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center gap-1"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Shortlist
                                </button>
                              )}
                              {!isRejected && !isShortlistedOrHigher && (
                                <button
                                  onClick={(e) => { 
                                    e.stopPropagation(); 
                                    updateStatus(app._id, 'NOT_SELECTED'); 
                                  }}
                                  className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm font-medium border border-red-200 hover:bg-red-100 transition-colors flex items-center gap-1"
                                >
                                  <Ban className="w-3.5 h-3.5" /> Reject
                                </button>
                              )}
                              {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                            </div>
                          </div>
                        </div>

                        {/* Expanded Quick Details */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden border-t border-gray-100"
                            >
                              <div className="p-5 sm:p-6 space-y-4">
                                <div className="flex flex-wrap gap-2">
                                  {['APPLIED', 'AI_SCREENED', 'UNDER_HR_REVIEW', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED', 'SELECTED', 'OFFER_SENT', 'HIRED', 'NOT_SELECTED'].map((status) => (
                                    <button
                                      key={status}
                                      onClick={(e) => { 
                                        e.stopPropagation(); 
                                        updateStatus(app._id, status); 
                                      }}
                                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                        appStatus === status
                                          ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                                          : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-600'
                                      }`}
                                    >
                                      {status.replace(/_/g, ' ')}
                                    </button>
                                  ))}
                                </div>

                                {Array.isArray(applicant?.skills) && applicant.skills.length > 0 && (
                                  <div>
                                    <p className="text-xs text-gray-400 mb-2">Skills</p>
                                    <div className="flex flex-wrap gap-1.5">
                                      {applicant.skills.map((skill, i) => (
                                        <span key={i} className="px-2.5 py-1 bg-orange-50 text-orange-700 rounded-md text-xs font-medium border border-orange-100">
                                          {typeof skill === 'string' ? skill : 'Invalid'}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      <ApplicantModal
        isOpen={!!modalApp}
        onClose={() => setModalApp(null)}
        application={modalApp}
        onStatusChange={updateStatus}
      />
    </div>
  );
};

export default HrApplications;