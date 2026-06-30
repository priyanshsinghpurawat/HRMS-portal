import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ArrowLeft,
  Users,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Power,
  PowerOff,
  Trash2,
  KeyRound,
  X,
  CheckCircle2,
  AlertCircle,
  Mail,
  Phone,
  Shield,
  Building2,
  Clock,
  CalendarDays,
  RefreshCw,
  Filter,
  User,
  Hash,
  MoreHorizontal
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
    navigate("/company", { replace: true });
    return true;
  }
  return false;
};

const BASE_URL = window.API_BASE_URL;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } }
};

const rowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 80, damping: 15 } }
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

const modalVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25 } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
};

// ==========================
// REUSABLE COMPONENTS
// ==========================

const StatusBadge = ({ status }) => {
  const isActive = status === 'active';
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
      isActive 
        ? 'bg-green-50 text-green-700 border-green-200' 
        : 'bg-red-50 text-red-700 border-red-200'
    }`}>
      {isActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : <PowerOff className="w-3.5 h-3.5" />}
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
};

const CategoryBadge = ({ category }) => {
  const colors = {
    technical: 'bg-blue-50 text-blue-700 border-blue-200',
    'non-technical': 'bg-purple-50 text-purple-700 border-purple-200',
    recruiter: 'bg-orange-50 text-orange-700 border-orange-200',
    operations: 'bg-teal-50 text-teal-700 border-teal-200'
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${colors[category] || colors.technical}`}>
      {category?.replace('-', ' ')?.replace(/\w/g, l => l.toUpperCase())}
    </span>
  );
};

const SkeletonLoader = () => (
  <div className="animate-pulse">
    <div className="h-12 bg-gray-100 rounded-t-xl mb-1" />
    {[...Array(5)].map((_, i) => (
      <div key={i} className="h-16 bg-gray-50 border-b border-gray-100" />
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
      <Users className="w-10 h-10 text-orange-300" />
    </div>
    <h3 className="text-lg font-semibold text-gray-800 mb-1">
      {searchQuery ? "No HRs found" : "No HRs yet"}
    </h3>
    <p className="text-sm text-gray-400 text-center max-w-sm mb-4">
      {searchQuery 
        ? `No results matching "${searchQuery}". Try different search terms.` 
        : "Your HR directory is empty. Add HR managers to get started."}
    </p>
    {searchQuery && (
      <button onClick={onClear}
        className="px-4 py-2 bg-orange-50 text-orange-600 rounded-lg font-medium hover:bg-orange-100 transition-colors">
        Clear Search
      </button>
    )}
  </motion.div>
);

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, confirmColor = "red", icon: Icon }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div variants={overlayVariants} initial="hidden" animate="visible" exit="exit"
        className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
        <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit"
          className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${confirmColor === 'red' ? 'bg-red-50' : 'bg-orange-50'}`}>
              {Icon ? <Icon className={`w-5 h-5 ${confirmColor === 'red' ? 'text-red-500' : 'text-orange-500'}`} /> : 
                <AlertCircle className={`w-5 h-5 ${confirmColor === 'red' ? 'text-red-500' : 'text-orange-500'}`} />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">{title}</h3>
            </div>
          </div>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="flex gap-3">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
              Cancel
            </button>
            <button onClick={onConfirm}
              className={`flex-1 py-2.5 rounded-xl font-semibold text-white transition-colors ${
                confirmColor === 'red' ? 'bg-red-500 hover:bg-red-600' : 'bg-orange-500 hover:bg-orange-600'
              }`}>
              {confirmText}
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const HrDetailPanel = ({ hr, onClose }) => {
  if (!hr) return null;
  return (
    <AnimatePresence>
      <motion.div variants={overlayVariants} initial="hidden" animate="visible" exit="exit" className="fixed inset-0 z-50">
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
        <motion.div variants={slideOverVariants} initial="hidden" animate="visible" exit="exit"
          className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl overflow-y-auto">
          <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-orange-100 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold">
                {hr.personalEmail?.charAt(0).toUpperCase() || "H"}
              </div>
              <div>
                <h2 className="font-bold text-gray-800 text-sm">HR Details</h2>
                <p className="text-xs text-gray-500">ID: {hr._id?.slice(-6)}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="p-6 space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-orange-50 to-white rounded-2xl border border-orange-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">{hr.personalEmail?.split("@")[0] || "HR Manager"}</h3>
                <StatusBadge status={hr.isActive ? 'active' : 'inactive'} />
              </div>
              <p className="text-gray-600">{hr.designation}</p>
            </motion.div>

            {[
              { title: "Contact Information", icon: Mail, items: [
                { label: "Email", value: hr.personalEmail, icon: Mail },
                { label: "Phone", value: hr.phone, icon: Phone },
              ]},
              { title: "Professional Details", icon: Shield, items: [
                { label: "Category", value: hr.category, icon: Building2 },
                { label: "Designation", value: hr.designation, icon: Shield },
              ]},
              { title: "Account Info", icon: Clock, items: [
                { label: "Created", value: new Date(hr.createdAt).toLocaleDateString(), icon: CalendarDays },
                { label: "Last Updated", value: new Date(hr.updatedAt).toLocaleDateString(), icon: Clock },
              ]}
            ].map((section, idx) => {
              const SectionIcon = section.icon;
              return (
                <motion.div key={section.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                  className="bg-gray-50/50 rounded-2xl border border-gray-100 overflow-hidden">
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
                            <p className="text-sm font-medium text-gray-800 mt-0.5">{item.value || "N/A"}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const EditModal = ({ isOpen, onClose, hr, onSave, saving }) => {
  const [formData, setFormData] = useState({ personalEmail: '', category: '', designation: '', phone: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (hr) {
      setFormData({
        personalEmail: hr.personalEmail || '',
        category: hr.category || 'technical',
        designation: hr.designation || '',
        phone: hr.phone || ''
      });
      setErrors({});
    }
  }, [hr]);

  const categories = ['technical', 'non-technical', 'recruiter', 'operations'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.personalEmail.trim()) newErrors.personalEmail = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.personalEmail)) newErrors.personalEmail = 'Invalid email';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.designation.trim()) newErrors.designation = 'Designation is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    else if (!/^\+?[\d\s-]{10,}$/.test(formData.phone.replace(/\s/g, ''))) newErrors.phone = 'Invalid phone';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) onSave(formData);
  };

  const inputClass = (error) => `w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 ${
    error ? 'border-red-300 bg-red-50/30' : 'border-gray-200 hover:border-orange-200'
  }`;

  return (
    <AnimatePresence>
      {isOpen && hr && (
        <motion.div variants={overlayVariants} initial="hidden" animate="visible" exit="exit"
          className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit"
            className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                  <Pencil className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">Edit HR</h3>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Personal Email <span className="text-red-500">*</span></label>
                <input type="email" name="personalEmail" value={formData.personalEmail} onChange={handleChange}
                  className={inputClass(errors.personalEmail)} />
                {errors.personalEmail && <p className="text-xs text-red-500 mt-1">{errors.personalEmail}</p>}
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Category <span className="text-red-500">*</span></label>
                <select name="category" value={formData.category} onChange={handleChange}
                  className={inputClass(errors.category)}>
                  {categories.map(c => <option key={c} value={c}>{c.replace('-', ' ').replace(/\w/g, l => l.toUpperCase())}</option>)}
                </select>
                {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Designation <span className="text-red-500">*</span></label>
                <input type="text" name="designation" value={formData.designation} onChange={handleChange}
                  className={inputClass(errors.designation)} />
                {errors.designation && <p className="text-xs text-red-500 mt-1">{errors.designation}</p>}
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Phone <span className="text-red-500">*</span></label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                  className={inputClass(errors.phone)} />
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose}
                  className="flex-1 py-3 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className={`flex-1 py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all ${
                    saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-200'
                  }`}>
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : <><CheckCircle2 className="w-4 h-4" />Save Changes</>}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ==========================
// MAIN COMPONENT
// ==========================
const HrDirectory = () => {
  const navigate = useNavigate();
  const [hrs, setHrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedHr, setSelectedHr] = useState(null);
  const [editModal, setEditModal] = useState({ isOpen: false, hr: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, hr: null });
  const [resetModal, setResetModal] = useState({ isOpen: false, hr: null });
  const [actionLoading, setActionLoading] = useState(false);
  const itemsPerPage = 10;

  const categories = ['all', 'technical', 'non-technical', 'recruiter', 'operations'];

  useEffect(() => { fetchHrs(); }, []);

  const fetchHrs = async () => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) {
        toast.error("Please login again", { position: "top-center" });
        navigate("/hrms", { replace: true });
        return;
      }
      const { data } = await axios.get(`${BASE_URL}/company/hr`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      setHrs(data.data || []);
    } catch (error) {
      console.error("Fetch HR Error:", error);
      const wasExpired = handleApiError(error, navigate);
      if (!wasExpired) toast.error(error?.response?.data?.message || "Failed to fetch HRs", { position: "top-center" });
    } finally { setLoading(false); }
  };

  const filteredHrs = useMemo(() => {
    let filtered = hrs;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(h =>
        h.personalEmail?.toLowerCase().includes(query) ||
        h.designation?.toLowerCase().includes(query) ||
        h.category?.toLowerCase().includes(query) ||
        h.phone?.toLowerCase().includes(query)
      );
    }
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(h => h.category === categoryFilter);
    }
    return filtered;
  }, [hrs, searchQuery, categoryFilter]);

  const totalPages = Math.ceil(filteredHrs.length / itemsPerPage);
  const paginatedHrs = filteredHrs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleToggleStatus = async (hr) => {
    setActionLoading(true);
    const toastId = toast.loading(hr.isActive ? 'Deactivating...' : 'Activating...');
    try {
      const token = getToken();
      if (!token) { toast.error("Please login again", { id: toastId }); navigate("/hrms"); return; }
      const endpoint = hr.isActive ? `${BASE_URL}/company/hr/${hr._id}/deactivate` : `${BASE_URL}/company/hr/${hr._id}/activate`;
      await axios.patch(endpoint, {}, { headers: { Authorization: `Bearer ${token}` } });
      setHrs(prev => prev.map(h => h._id === hr._id ? { ...h, isActive: !h.isActive } : h));
      toast.success(`HR ${hr.isActive ? 'deactivated' : 'activated'} successfully`, { id: toastId });
    } catch (error) {
      const wasExpired = handleApiError(error, navigate);
      if (!wasExpired) toast.error(error?.response?.data?.message || "Action failed", { id: toastId });
    } finally { setActionLoading(false); }
  };

  const handleDelete = async () => {
    const hr = deleteModal.hr;
    setDeleteModal({ isOpen: false, hr: null });
    const toastId = toast.loading('Deleting HR...');
    try {
      const token = getToken();
      if (!token) { toast.error("Please login again", { id: toastId }); navigate("/hrms"); return; }
      await axios.delete(`${BASE_URL}/company/hr/${hr._id}`, { headers: { Authorization: `Bearer ${token}` } });
      setHrs(prev => prev.filter(h => h._id !== hr._id));
      if (selectedHr?._id === hr._id) setSelectedHr(null);
      toast.success('HR deleted successfully', { id: toastId });
    } catch (error) {
      const wasExpired = handleApiError(error, navigate);
      if (!wasExpired) toast.error(error?.response?.data?.message || "Delete failed", { id: toastId });
    }
  };

  const handleUpdate = async (formData) => {
    const hr = editModal.hr;
    setActionLoading(true);
    const toastId = toast.loading('Updating HR...');
    try {
      const token = getToken();
      if (!token) { toast.error("Please login again", { id: toastId }); navigate("/hrms"); return; }
      await axios.put(`${BASE_URL}/company/hr/${hr._id}`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      setHrs(prev => prev.map(h => h._id === hr._id ? { ...h, ...formData } : h));
      setEditModal({ isOpen: false, hr: null });
      toast.success('HR updated successfully', { id: toastId });
    } catch (error) {
      const wasExpired = handleApiError(error, navigate);
      if (!wasExpired) toast.error(error?.response?.data?.message || "Update failed", { id: toastId });
    } finally { setActionLoading(false); }
  };

  const handleResetPassword = async () => {
    const hr = resetModal.hr;
    setResetModal({ isOpen: false, hr: null });
    const toastId = toast.loading('Sending reset email...');
    try {
      const token = getToken();
      if (!token) { toast.error("Please login again", { id: toastId }); navigate("/hrms"); return; }
      await axios.post(`${BASE_URL}/company/hr/${hr._id}/reset-password`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Password reset email sent successfully', { id: toastId });
    } catch (error) {
      const wasExpired = handleApiError(error, navigate);
      if (!wasExpired) toast.error(error?.response?.data?.message || "Reset failed", { id: toastId });
    }
  };

  const handleViewDetails = async (hr) => {
    try {
      const token = getToken();
      if (!token) { toast.error("Please login again"); navigate("/hrms"); return; }
      const { data } = await axios.get(`${BASE_URL}/company/hr/${hr._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedHr(data.data);
    } catch (error) {
      const wasExpired = handleApiError(error, navigate);
      if (!wasExpired) toast.error("Failed to fetch details");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-white to-orange-50/30">
      {/* Header */}
      <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-md border-b border-orange-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <motion.button whileHover={{ scale: 1.05, x: -2 }} whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/company-dashboard')}
                className="p-2.5 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">HR Directory</h1>
                <p className="text-sm text-gray-500">Manage all HR employees</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-4 py-2 bg-orange-50 text-orange-700 rounded-xl text-sm font-semibold border border-orange-200">
                <Users className="w-4 h-4 inline mr-2" />
                {hrs.length} HRs
              </span>
            </div>
          </div>
        </div>
      </motion.nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Search & Filter Bar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg shadow-orange-100/20 border border-orange-50 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="text" value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder="Search by email, designation, category, phone..."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all" />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
              className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400/50 text-sm font-medium text-gray-700">
              {categories.map(c => (
                <option key={c} value={c}>{c === 'all' ? 'All Categories' : c.replace('-', ' ').replace(/\w/g, l => l.toUpperCase())}</option>
              ))}
            </select>
            <button onClick={fetchHrs}
              className="px-4 py-3 bg-orange-50 text-orange-600 rounded-xl font-medium hover:bg-orange-100 transition-colors flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </motion.div>

        {/* Table Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-xl shadow-orange-100/30 border border-orange-50 overflow-hidden">
          {loading ? (
            <div className="p-6"><SkeletonLoader /></div>
          ) : filteredHrs.length === 0 ? (
            <EmptyState searchQuery={searchQuery} onClear={() => { setSearchQuery(""); setCategoryFilter("all"); }} />
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-orange-50/50 border-b border-orange-100">
                      {['HR', 'Email', 'Category', 'Designation', 'Phone', 'Status', 'Actions'].map(h => (
                        <th key={h} className="px-4 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <motion.tbody variants={containerVariants} initial="hidden" animate="visible">
                    {paginatedHrs.map((hr) => (
                      <motion.tr key={hr._id} variants={rowVariants}
                        whileHover={{ backgroundColor: "rgba(249, 115, 22, 0.03)" }}
                        className="border-b border-gray-50 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold">
                              {hr.personalEmail?.charAt(0).toUpperCase() || "H"}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800 text-sm">{hr.personalEmail?.split("@")[0] || "Unknown"}</p>
                              <p className="text-xs text-gray-400">{hr._id?.slice(-6)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">{hr.personalEmail}</td>
                        <td className="px-4 py-4"><CategoryBadge category={hr.category} /></td>
                        <td className="px-4 py-4 text-sm font-medium text-gray-700">{hr.designation || "N/A"}</td>
                        <td className="px-4 py-4 text-sm text-gray-600">{hr.phone || "N/A"}</td>
                        <td className="px-4 py-4"><StatusBadge status={hr.isActive ? 'active' : 'inactive'} /></td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleViewDetails(hr)} title="View Details"
                              className="p-2 hover:bg-orange-50 rounded-lg transition-colors text-orange-600">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button onClick={() => setEditModal({ isOpen: true, hr })} title="Edit HR"
                              className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleToggleStatus(hr)} disabled={actionLoading}
                              title={hr.isActive ? "Deactivate" : "Activate"}
                              className={`p-2 rounded-lg transition-colors ${hr.isActive ? 'hover:bg-red-50 text-red-500' : 'hover:bg-green-50 text-green-500'}`}>
                              {hr.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                            </button>
                            <button onClick={() => setResetModal({ isOpen: true, hr })} title="Reset Password"
                              className="p-2 hover:bg-amber-50 rounded-lg transition-colors text-amber-600">
                              <KeyRound className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeleteModal({ isOpen: true, hr })} title="Delete HR"
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
                {paginatedHrs.map((hr) => (
                  <motion.div key={hr._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileTap={{ scale: 0.98 }}
                    className="bg-white border border-orange-100 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold">
                          {hr.personalEmail?.charAt(0).toUpperCase() || "H"}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{hr.personalEmail?.split("@")[0]}</p>
                          <p className="text-xs text-gray-400">{hr.designation}</p>
                        </div>
                      </div>
                      <StatusBadge status={hr.isActive ? 'active' : 'inactive'} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div><p className="text-xs text-gray-400">Category</p><p className="font-medium">{hr.category}</p></div>
                      <div><p className="text-xs text-gray-400">Phone</p><p className="font-medium">{hr.phone}</p></div>
                    </div>
                    <div className="flex gap-1 pt-2 border-t border-gray-100">
                      <button onClick={() => handleViewDetails(hr)} className="flex-1 py-2 bg-orange-50 text-orange-600 rounded-lg text-xs font-medium flex items-center justify-center gap-1">
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                      <button onClick={() => setEditModal({ isOpen: true, hr })} className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium flex items-center justify-center gap-1">
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button onClick={() => handleToggleStatus(hr)} className={`flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1 ${hr.isActive ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                        {hr.isActive ? <PowerOff className="w-3.5 h-3.5" /> : <Power className="w-3.5 h-3.5" />}
                        {hr.isActive ? 'Off' : 'On'}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-4 py-4 border-t border-orange-50 flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredHrs.length)} of {filteredHrs.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                      className="p-2 rounded-lg hover:bg-orange-50 disabled:opacity-40 transition-colors">
                      <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button key={i + 1} onClick={() => setCurrentPage(i + 1)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${currentPage === i + 1 ? 'bg-orange-500 text-white' : 'hover:bg-orange-50 text-gray-600'}`}>
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
        </motion.div>
      </div>

      {/* Detail Panel */}
      <AnimatePresence>
        {selectedHr && <HrDetailPanel hr={selectedHr} onClose={() => setSelectedHr(null)} />}
      </AnimatePresence>

      {/* Edit Modal */}
      <EditModal isOpen={editModal.isOpen} hr={editModal.hr} onClose={() => setEditModal({ isOpen: false, hr: null })}
        onSave={handleUpdate} saving={actionLoading} />

      {/* Delete Confirmation */}
      <ConfirmModal isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, hr: null })}
        onConfirm={handleDelete}
        title="Delete HR"
        message={`Are you sure you want to permanently delete this HR? This action cannot be undone.`}
        confirmText="Delete" confirmColor="red" icon={Trash2} />

      {/* Reset Password Confirmation */}
      <ConfirmModal isOpen={resetModal.isOpen}
        onClose={() => setResetModal({ isOpen: false, hr: null })}
        onConfirm={handleResetPassword}
        title="Reset Password"
        message="Reset password link will be sent to HR email."
        confirmText="Send Reset Link" confirmColor="orange" icon={KeyRound} />
    </div>
  );
};

export default HrDirectory;