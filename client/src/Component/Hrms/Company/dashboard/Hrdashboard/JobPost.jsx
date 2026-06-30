import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ArrowLeft,
  Briefcase,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  Building2,
  MapPin,
  DollarSign,
  Users,
  Clock,
  Tag,
  Layers,
  Star,
  CalendarDays,
  Hash,
  Filter,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';

// ==========================
// AUTH HELPERS
// ==========================
const getToken = () => sessionStorage.getItem("companyToken");
const clearAuth = () => {
  sessionStorage.removeItem("companyToken");
  sessionStorage.removeItem("companyUser");
};

const handleApiError = (error, navigate) => {
  const status = error?.response?.status;
  const message = (error?.response?.data?.message || "").toLowerCase();
  const isUnauthorized = status === 401;
  const isTokenExpired = 
    message.includes("jwt expired") || 
    message.includes("unauthorized") || 
    message.includes("invalid token") ||
    message.includes("token expired") ||
    message.includes("no token");

  if (isUnauthorized || isTokenExpired) {
    clearAuth();
    toast.error("Session expired. Please login again.", {
      duration: 4000,
      position: "top-center",
    });
    navigate("/company-login", { replace: true });
    return true;
  }
  return false;
};

const BASE_URL = window.API_BASE_URL;

// ==========================
// ANIMATION VARIANTS
// ==========================
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 80, damping: 15 } }
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25 } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

const slideOverVariants = {
  hidden: { x: "100%" },
  visible: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
  exit: { x: "100%", transition: { duration: 0.3 } }
};

// ==========================
// REUSABLE COMPONENTS
// ==========================

const StatusBadge = ({ type, value }) => {
  const styles = {
    employmentType: {
      'full-time': 'bg-green-50 text-green-700 border-green-200',
      'part-time': 'bg-blue-50 text-blue-700 border-blue-200',
      'internship': 'bg-purple-50 text-purple-700 border-purple-200',
      'contract': 'bg-orange-50 text-orange-700 border-orange-200'
    },
    experienceLevel: {
      'junior': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'mid': 'bg-amber-50 text-amber-700 border-amber-200',
      'senior': 'bg-rose-50 text-rose-700 border-rose-200'
    }
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${styles[type]?.[value] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
      {value?.replace('-', ' ')?.replace(/\w/g, l => l.toUpperCase())}
    </span>
  );
};

const SkillBadge = ({ skill, onRemove, removable = false }) => (
  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
    {skill}
    {removable && (
      <button onClick={() => onRemove(skill)} className="hover:text-orange-900 transition-colors">
        <X className="w-3 h-3" />
      </button>
    )}
  </span>
);

const SkeletonLoader = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-12 bg-gray-100 rounded-xl" />
    {[...Array(4)].map((_, i) => (
      <div key={i} className="h-20 bg-gray-50 rounded-xl" />
    ))}
  </div>
);

const EmptyState = ({ searchQuery, onClear }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-16 px-4"
  >
    <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-4">
      <Briefcase className="w-10 h-10 text-orange-300" />
    </div>
    <h3 className="text-lg font-semibold text-gray-800 mb-1">
      {searchQuery ? "No jobs found" : "No jobs posted yet"}
    </h3>
    <p className="text-sm text-gray-400 text-center max-w-sm mb-4">
      {searchQuery 
        ? `No results matching "${searchQuery}". Try different search terms.` 
        : "Start by creating your first job post using the form on the left."}
    </p>
    {searchQuery && (
      <button
        onClick={onClear}
        className="px-4 py-2 bg-orange-50 text-orange-600 rounded-lg font-medium hover:bg-orange-100 transition-colors"
      >
        Clear Search
      </button>
    )}
  </motion.div>
);

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, confirmColor = "red" }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${confirmColor === 'red' ? 'bg-red-50' : 'bg-orange-50'}`}>
              <AlertCircle className={`w-5 h-5 ${confirmColor === 'red' ? 'text-red-500' : 'text-orange-500'}`} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">{title}</h3>
            </div>
          </div>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 py-2.5 rounded-xl font-semibold text-white transition-colors ${
                confirmColor === 'red' ? 'bg-red-500 hover:bg-red-600' : 'bg-orange-500 hover:bg-orange-600'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const JobDetailModal = ({ job, onClose, onDelete }) => {
  if (!job) return null;

  const formatSalary = (min, max) => {
    const format = (val) => val >= 100000 ? `${(val/100000).toFixed(1)}L` : `${(val/1000).toFixed(0)}K`;
    return `₹${format(min)} - ₹${format(max)} PA`;
  };

  const sections = [
    {
      title: "Job Overview",
      icon: Briefcase,
      items: [
        { label: "Job Title", value: job.title, icon: Briefcase },
        { label: "Department", value: job.department, icon: Building2 },
        { label: "Employment Type", value: job.employmentType, icon: Layers },
        { label: "Experience Level", value: job.experienceLevel, icon: Star },
      ]
    },
    {
      title: "Compensation & Location",
      icon: DollarSign,
      items: [
        { label: "Salary Range", value: formatSalary(job.salaryMin, job.salaryMax), icon: DollarSign },
        { label: "Location", value: job.location, icon: MapPin },
        { label: "Openings", value: job.openings, icon: Users },
      ]
    },
    {
      title: "Requirements",
      icon: Tag,
      items: [
        { label: "Skills Required", value: job.skills?.join(", ") || "N/A", icon: Tag },
      ]
    }
  ];

  return (
    <AnimatePresence>
      <motion.div
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 z-50"
      >
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          variants={slideOverVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="absolute right-0 top-0 h-full w-full max-w-xl bg-white shadow-2xl overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-orange-100 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-gray-800 text-sm">Job Details</h2>
                <p className="text-xs text-gray-500">ID: {job._id?.slice(-6)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onDelete(job)}
                className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-500"
                title="Delete Job"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Title & Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-orange-50 to-white rounded-2xl border border-orange-100 p-6"
            >
              <h1 className="text-2xl font-bold text-gray-800 mb-2">{job.title}</h1>
              <p className="text-gray-600 leading-relaxed">{job.description}</p>
              <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <CalendarDays className="w-4 h-4" />
                  Posted {new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {job.employmentType?.replace('-', ' ')}
                </span>
              </div>
            </motion.div>

            {/* Sections */}
            {sections.map((section, idx) => {
              const SectionIcon = section.icon;
              return (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-gray-50/50 rounded-2xl border border-gray-100 overflow-hidden"
                >
                  <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                    <SectionIcon className="w-5 h-5 text-orange-500" />
                    <h3 className="font-semibold text-gray-800">{section.title}</h3>
                  </div>
                  <div className="p-5 space-y-4">
                    {section.items.map((item) => {
                      const ItemIcon = item.icon;
                      return (
                        <div key={item.label} className="flex items-start gap-3">
                          <div className="p-2 bg-white rounded-lg shadow-sm">
                            <ItemIcon className="w-4 h-4 text-orange-400" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{item.label}</p>
                            <p className="text-sm font-medium text-gray-800 mt-0.5">{item.value}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}

            {/* Skills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Skills Required</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills?.map((skill) => (
                  <SkillBadge key={skill} skill={skill} />
                )) || <span className="text-gray-400 text-sm">No skills specified</span>}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ==========================
// MAIN COMPONENT
// ==========================
const JobPost = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedJob, setSelectedJob] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, job: null });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: '',
    employmentType: '',
    experienceLevel: '',
    salaryMin: '',
    salaryMax: '',
    location: '',
    skills: [],
    openings: 1
  });
  const [skillInput, setSkillInput] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const itemsPerPage = 8;

  const employmentTypes = ['full-time', 'part-time', 'internship', 'contract'];
  const experienceLevels = ['junior', 'mid', 'senior'];
  const departments = ['Engineering', 'HR', 'Marketing', 'Finance', 'Sales', 'Support', 'Design', 'Product'];

  // Fetch jobs on mount
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) {
        toast.error("Please login again", { position: "top-center" });
        navigate("/company-login", { replace: true });
        return;
      }

      const { data } = await axios.get(`${BASE_URL}/jobs`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      setJobs(data.data || []);
    } catch (error) {
      console.error("Fetch Jobs Error:", error);
      const wasExpired = handleApiError(error, navigate);
      if (!wasExpired) {
        toast.error(error?.response?.data?.message || "Failed to fetch jobs", { position: "top-center" });
      }
    } finally {
      setLoading(false);
    }
  };

  // Form handlers
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => { const newErrors = { ...prev }; delete newErrors[name]; return newErrors; });
    }
  };

  const handleAddSkill = (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!formData.skills.includes(skillInput.trim())) {
        setFormData(prev => ({ ...prev, skills: [...prev.skills, skillInput.trim()] }));
      }
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Job title is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.department) errors.department = 'Department is required';
    if (!formData.employmentType) errors.employmentType = 'Employment type is required';
    if (!formData.experienceLevel) errors.experienceLevel = 'Experience level is required';
    if (!formData.salaryMin) errors.salaryMin = 'Minimum salary is required';
    if (!formData.salaryMax) errors.salaryMax = 'Maximum salary is required';
    if (parseInt(formData.salaryMin) > parseInt(formData.salaryMax)) {
      errors.salaryMax = 'Max salary must be greater than min salary';
    }
    if (!formData.location.trim()) errors.location = 'Location is required';
    if (formData.skills.length === 0) errors.skills = 'At least one skill is required';
    if (!formData.openings || parseInt(formData.openings) < 1) errors.openings = 'Minimum 1 opening required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the form errors', { icon: <AlertCircle className="w-5 h-5 text-red-500" /> });
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading('Posting job...');

    try {
      const token = getToken();
      if (!token) {
        toast.error("Please login again", { id: toastId });
        navigate("/company-login", { replace: true });
        return;
      }

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        department: formData.department,
        employmentType: formData.employmentType,
        experienceLevel: formData.experienceLevel,
        salaryMin: parseInt(formData.salaryMin),
        salaryMax: parseInt(formData.salaryMax),
        location: formData.location.trim(),
        skills: formData.skills,
        openings: parseInt(formData.openings)
      };

      await axios.post(`${BASE_URL}/jobs`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      toast.success('Job posted successfully!', {
        id: toastId,
        icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
      });

      // Reset form
      setFormData({
        title: '', description: '', department: '', employmentType: '', experienceLevel: '',
        salaryMin: '', salaryMax: '', location: '', skills: [], openings: 1
      });
      setSkillInput('');
      setFormErrors({});

      // Refresh job list
      await fetchJobs();

    } catch (error) {
      console.error('Post Job Error:', error);
      const wasExpired = handleApiError(error, navigate);
      if (!wasExpired) {
        toast.error(error?.response?.data?.message || 'Failed to post job', { id: toastId });
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Search & pagination
  const filteredJobs = useMemo(() => {
    if (!searchQuery.trim()) return jobs;
    const query = searchQuery.toLowerCase();
    return jobs.filter(job =>
      job.title?.toLowerCase().includes(query) ||
      job.department?.toLowerCase().includes(query) ||
      job.location?.toLowerCase().includes(query) ||
      job.skills?.some(s => s.toLowerCase().includes(query))
    );
  }, [jobs, searchQuery]);

  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDelete = async () => {
    const job = deleteModal.job;
    if (!job) return;

    setDeleteModal({ isOpen: false, job: null });
    const toastId = toast.loading('Deleting job...');

    try {
      const token = getToken();
      if (!token) {
        toast.error("Please login again", { id: toastId });
        navigate("/company-login", { replace: true });
        return;
      }

      await axios.delete(`${BASE_URL}/jobs/${job._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Remove from UI instantly
      setJobs(prev => prev.filter(j => j._id !== job._id));
      if (selectedJob?._id === job._id) setSelectedJob(null);

      toast.success('Job deleted successfully', { id: toastId });
    } catch (error) {
      console.error('Delete Error:', error);
      const wasExpired = handleApiError(error, navigate);
      if (!wasExpired) {
        toast.error(error?.response?.data?.message || 'Failed to delete job', { id: toastId });
      }
    }
  };

  const formatSalary = (min, max) => {
    const format = (val) => {
      if (!val) return '0';
      if (val >= 100000) return `${(val/100000).toFixed(0)}L`;
      return `${(val/1000).toFixed(0)}K`;
    };
    return `₹${format(min)} - ₹${format(max)}`;
  };

  const inputClasses = (error) => `
    w-full px-4 py-3 bg-white rounded-xl border transition-all duration-300
    focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400
    ${error ? 'border-red-300 focus:ring-red-200 bg-red-50/30' : 'border-gray-200 hover:border-orange-200'}
  `;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-white to-orange-50/30">
      {/* Header */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-md border-b border-orange-100 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05, x: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/hrdashboard')}
                className="p-2.5 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Job Management</h1>
                <p className="text-sm text-gray-500">Create and manage your company job posts</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-4 py-2 bg-orange-50 text-orange-700 rounded-xl text-sm font-semibold border border-orange-200">
                <Briefcase className="w-4 h-4 inline mr-2" />
                {jobs.length} Jobs
              </span>
            </div>
          </div>
        </div>
      </motion.nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* LEFT: Create Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-3xl shadow-xl shadow-orange-100/30 border border-orange-50 overflow-hidden sticky top-24">
              <div className="h-1.5 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600" />
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">Post New Job</h2>
                    <p className="text-xs text-gray-500">Fill in the details below</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Job Title */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                      Job Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text" name="title" value={formData.title} onChange={handleFormChange}
                      placeholder="e.g. Senior Software Engineer"
                      className={inputClasses(formErrors.title)}
                    />
                    {formErrors.title && <p className="text-xs text-red-500 mt-1">{formErrors.title}</p>}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="description" value={formData.description} onChange={handleFormChange}
                      placeholder="Describe the role, responsibilities, and requirements..."
                      rows={4}
                      className={`${inputClasses(formErrors.description)} resize-none`}
                    />
                    {formErrors.description && <p className="text-xs text-red-500 mt-1">{formErrors.description}</p>}
                  </div>

                  {/* Department & Employment Type */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                        Department <span className="text-red-500">*</span>
                      </label>
                      <select name="department" value={formData.department} onChange={handleFormChange}
                        className={inputClasses(formErrors.department)}>
                        <option value="">Select</option>
                        {departments.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                      {formErrors.department && <p className="text-xs text-red-500 mt-1">{formErrors.department}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                        Type <span className="text-red-500">*</span>
                      </label>
                      <select name="employmentType" value={formData.employmentType} onChange={handleFormChange}
                        className={inputClasses(formErrors.employmentType)}>
                        <option value="">Select</option>
                        {employmentTypes.map(t => <option key={t} value={t}>{t.replace('-', ' ')}</option>)}
                      </select>
                      {formErrors.employmentType && <p className="text-xs text-red-500 mt-1">{formErrors.employmentType}</p>}
                    </div>
                  </div>

                  {/* Experience Level */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                      Experience Level <span className="text-red-500">*</span>
                    </label>
                    <select name="experienceLevel" value={formData.experienceLevel} onChange={handleFormChange}
                      className={inputClasses(formErrors.experienceLevel)}>
                      <option value="">Select</option>
                      {experienceLevels.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
                    </select>
                    {formErrors.experienceLevel && <p className="text-xs text-red-500 mt-1">{formErrors.experienceLevel}</p>}
                  </div>

                  {/* Salary Range */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                        Salary Min (₹) <span className="text-red-500">*</span>
                      </label>
                      <input type="number" name="salaryMin" value={formData.salaryMin} onChange={handleFormChange}
                        placeholder="e.g. 50000" className={inputClasses(formErrors.salaryMin)} />
                      {formErrors.salaryMin && <p className="text-xs text-red-500 mt-1">{formErrors.salaryMin}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                        Salary Max (₹) <span className="text-red-500">*</span>
                      </label>
                      <input type="number" name="salaryMax" value={formData.salaryMax} onChange={handleFormChange}
                        placeholder="e.g. 100000" className={inputClasses(formErrors.salaryMax)} />
                      {formErrors.salaryMax && <p className="text-xs text-red-500 mt-1">{formErrors.salaryMax}</p>}
                    </div>
                  </div>

                  {/* Location & Openings */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                        Location <span className="text-red-500">*</span>
                      </label>
                      <input type="text" name="location" value={formData.location} onChange={handleFormChange}
                        placeholder="e.g. City, Country" className={inputClasses(formErrors.location)} />
                      {formErrors.location && <p className="text-xs text-red-500 mt-1">{formErrors.location}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                        Openings <span className="text-red-500">*</span>
                      </label>
                      <input type="number" name="openings" value={formData.openings} onChange={handleFormChange}
                        min="1" className={inputClasses(formErrors.openings)} />
                      {formErrors.openings && <p className="text-xs text-red-500 mt-1">{formErrors.openings}</p>}
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                      Skills <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={handleAddSkill}
                      placeholder="Type skill and press Enter..."
                      className={inputClasses(formErrors.skills)}
                    />
                    {formErrors.skills && <p className="text-xs text-red-500 mt-1">{formErrors.skills}</p>}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.skills.map(skill => (
                        <SkillBadge key={skill} skill={skill} onRemove={handleRemoveSkill} removable />
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    whileHover={!submitting ? { scale: 1.02 } : {}}
                    whileTap={!submitting ? { scale: 0.98 } : {}}
                    disabled={submitting}
                    className={`w-full py-3.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all ${
                      submitting
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-200'
                    }`}
                  >
                    {submitting ? (
                      <><Loader2 className="w-5 h-5 animate-spin" />Posting...</>
                    ) : (
                      <><Plus className="w-5 h-5" />Post Job</>
                    )}
                  </motion.button>
                </form>
              </div>
            </div>
          </motion.div>

          {/* RIGHT: Job List */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3"
          >
            {/* Search Bar */}
            <div className="bg-white rounded-2xl shadow-lg shadow-orange-100/20 border border-orange-50 p-4 mb-6">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text" value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    placeholder="Search by title, department, location, skills..."
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <button onClick={fetchJobs}
                  className="px-4 py-3 bg-orange-50 text-orange-600 rounded-xl font-medium hover:bg-orange-100 transition-colors flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </div>
            </div>

            {/* Job List Card */}
            <div className="bg-white rounded-3xl shadow-xl shadow-orange-100/30 border border-orange-50 overflow-hidden">
              {loading ? (
                <div className="p-6"><SkeletonLoader /></div>
              ) : filteredJobs.length === 0 ? (
                <EmptyState searchQuery={searchQuery} onClear={() => setSearchQuery("")} />
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-orange-50/50 border-b border-orange-100">
                          {['Job Title', 'Department', 'Type', 'Experience', 'Salary', 'Location', 'Openings', 'Skills', 'Actions'].map((h) => (
                            <th key={h} className="px-4 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <motion.tbody variants={containerVariants} initial="hidden" animate="visible">
                        {paginatedJobs.map((job) => (
                          <motion.tr
                            key={job._id}
                            variants={itemVariants}
                            whileHover={{ backgroundColor: "rgba(249, 115, 22, 0.03)" }}
                            className="border-b border-gray-50 transition-colors"
                          >
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-sm font-bold">
                                  {job.title?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-800 text-sm">{job.title}</p>
                                  <p className="text-xs text-gray-400">{job.employmentType?.replace('-', ' ')}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
                                {job.department}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <StatusBadge type="employmentType" value={job.employmentType} />
                            </td>
                            <td className="px-4 py-4">
                              <StatusBadge type="experienceLevel" value={job.experienceLevel} />
                            </td>
                            <td className="px-4 py-4 text-sm font-medium text-gray-700">
                              {formatSalary(job.salaryMin, job.salaryMax)}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                {job.location}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 rounded-lg text-xs font-semibold text-gray-700">
                                <Users className="w-3.5 h-3.5" />
                                {job.openings}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex flex-wrap gap-1">
                                {job.skills?.slice(0, 2).map(s => (
                                  <span key={s} className="px-2 py-0.5 bg-orange-50 text-orange-600 rounded text-xs">{s}</span>
                                ))}
                                {job.skills?.length > 2 && (
                                  <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">+{job.skills.length - 2}</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-1">
                                <button onClick={() => setSelectedJob(job)}
                                  className="p-2 hover:bg-orange-50 rounded-lg transition-colors text-orange-600">
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button onClick={() => setDeleteModal({ isOpen: true, job })}
                                  className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-500">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </motion.tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden p-4 space-y-4">
                    {paginatedJobs.map((job) => (
                      <motion.div
                        key={job._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileTap={{ scale: 0.98 }}
                        className="bg-white border border-orange-100 rounded-2xl p-4 shadow-sm"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold">
                              {job.title?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800 text-sm">{job.title}</p>
                              <p className="text-xs text-gray-400">{job.department}</p>
                            </div>
                          </div>
                          <StatusBadge type="employmentType" value={job.employmentType} />
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                          <div><p className="text-xs text-gray-400">Experience</p><p className="font-medium">{job.experienceLevel}</p></div>
                          <div><p className="text-xs text-gray-400">Salary</p><p className="font-medium">{formatSalary(job.salaryMin, job.salaryMax)}</p></div>
                          <div><p className="text-xs text-gray-400">Location</p><p className="font-medium">{job.location}</p></div>
                          <div><p className="text-xs text-gray-400">Openings</p><p className="font-medium">{job.openings}</p></div>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {job.skills?.map(s => <span key={s} className="px-2 py-0.5 bg-orange-50 text-orange-600 rounded text-xs">{s}</span>)}
                        </div>
                        <div className="flex gap-2 pt-2 border-t border-gray-100">
                          <button onClick={() => setSelectedJob(job)}
                            className="flex-1 py-2 bg-orange-50 text-orange-600 rounded-lg text-sm font-medium flex items-center justify-center gap-1">
                            <Eye className="w-4 h-4" /> View
                          </button>
                          <button onClick={() => setDeleteModal({ isOpen: true, job })}
                            className="flex-1 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium flex items-center justify-center gap-1">
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="px-4 py-4 border-t border-orange-50 flex items-center justify-between">
                      <p className="text-sm text-gray-500">
                        Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredJobs.length)} of {filteredJobs.length}
                      </p>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                          className="p-2 rounded-lg hover:bg-orange-50 disabled:opacity-40 transition-colors">
                          <ChevronLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        {[...Array(totalPages)].map((_, i) => (
                          <button key={i + 1} onClick={() => setCurrentPage(i + 1)}
                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                              currentPage === i + 1 ? 'bg-orange-500 text-white' : 'hover:bg-orange-50 text-gray-600'
                            }`}>
                            {i + 1}
                          </button>
                        ))}
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                          className="p-2 rounded-lg hover:bg-orange-50 disabled:opacity-40 transition-colors">
                          <ChevronRight className="w-5 h-5 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Job Detail Modal */}
      <AnimatePresence>
        {selectedJob && (
          <JobDetailModal
            job={selectedJob}
            onClose={() => setSelectedJob(null)}
            onDelete={(job) => setDeleteModal({ isOpen: true, job })}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, job: null })}
        onConfirm={handleDelete}
        title="Delete Job Post"
        message={`Are you sure you want to delete "${deleteModal.job?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmColor="red"
      />
    </div>
  );
};

export default JobPost;
