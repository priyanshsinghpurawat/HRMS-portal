import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Briefcase,
  Shield,
  Clock,
  CalendarDays,
  Pencil,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Link2,
  FileText,
  Languages,
  Upload,
  Building2,
  IdCard,
  UserCircle,
  Activity,
  Home,
  PhoneCall
} from 'lucide-react';

import { getToken, getUser, handleApiError, clearAuth } from "../../../../../utils/api";
import api from "../../../axiosInstance";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: "spring", stiffness: 80, damping: 15 }
  }
};

const tabContentVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
};

const ProfileEM = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [hasChanges, setHasChanges] = useState(false);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    phone: '',
    address: '',
    emergencyContact: ''
  });
  const [errors, setErrors] = useState({});

  const tabs = [
    { id: 'basic', label: 'Basic Details', icon: User },
    { id: 'employment', label: 'Employment', icon: Building2 },
    { id: 'contact', label: 'Contact Info', icon: PhoneCall },
    { id: 'documents', label: 'Documents', icon: FileText }
  ];

  // ✅ Fetch profile using centralized API instance
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);

    try {
      const token = getToken();
      if (!token) {
        toast.error("Please login again", { position: "top-center" });
        clearAuth();
        navigate("/employee-login", { replace: true });
        return;
      }

      // ✅ Employee profile endpoint
      const { data } = await api.get("/employee/profile");

      const profileData = data.data;
      setProfile(profileData);
      setFormData({
        phone: profileData.phone || "",
        address: profileData.address || "",
        emergencyContact: profileData.emergencyContact || "",
      });

    } catch (error) {
      console.error("Profile Error:", error);

      const wasSessionExpired = handleApiError(error, navigate, toast);

      if (!wasSessionExpired) {
        toast.error(
          error?.response?.data?.message || "Failed to load profile",
          { position: "top-center" }
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setHasChanges(true);
    if (errors[name]) {
      setErrors(prev => { const newErrors = { ...prev }; delete newErrors[name]; return newErrors; });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-]{10,}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!formData.emergencyContact.trim()) {
      newErrors.emergencyContact = 'Emergency contact is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Save profile using employee endpoint
  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors before saving');
      return;
    }

    setSaving(true);
    try {
      const { data } = await api.put("/employee/profile", {
        phone: formData.phone,
        address: formData.address,
        emergencyContact: formData.emergencyContact
      });

      setProfile(prev => ({
        ...prev,
        phone: formData.phone,
        address: formData.address,
        emergencyContact: formData.emergencyContact
      }));

      setHasChanges(false);
      setIsEditing(false);
      toast.success('Profile updated successfully', {
        icon: <CheckCircle2 className="w-5 h-5 text-green-500" />
      });
    } catch (error) {
      console.error('Error updating profile:', error);

      const wasSessionExpired = handleApiError(error, navigate, toast);

      if (!wasSessionExpired) {
        toast.error(error.response?.data?.message || 'Update failed');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setFormData({
      phone: profile?.phone || '',
      address: profile?.address || '',
      emergencyContact: profile?.emergencyContact || ''
    });
    setHasChanges(false);
    setErrors({});
    toast('Changes discarded', { icon: '↩️' });
  };

  const toggleEdit = () => {
    if (isEditing) {
      setIsEditing(false);
      setHasChanges(false);
      setFormData({
        phone: profile?.phone || '',
        address: profile?.address || '',
        emergencyContact: profile?.emergencyContact || ''
      });
    } else {
      setIsEditing(true);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'E';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  // Helper to safely get user ID string
  const getUserIdString = (userField) => {
    if (!userField) return null;
    if (typeof userField === 'string') return userField;
    if (typeof userField === 'object' && userField !== null) {
      return userField._id || userField.id || userField.toString?.() || null;
    }
    return null;
  };

  // Helper to safely get display name
  const getDisplayName = (profileData) => {
    if (!profileData) return 'Employee';
    if (profileData.user && typeof profileData.user === 'object' && profileData.user.name) {
      return profileData.user.name;
    }
    return profileData.personalEmail || profileData.employeeId || 'Employee';
  };

  // ==================== FIX: Calculate profileStrength based on filled fields ====================
  const profileStrength = useMemo(() => {
    if (!profile) return 0;
    
    const fields = [
      profile.employeeId,
      profile.department,
      profile.designation,
      profile.reportingManager,
      profile.companyEmail,
      profile.personalEmail,
      profile.phone,
      profile.address,
      profile.emergencyContact,
      profile.about
    ];
    
    const filledCount = fields.filter(f => {
      if (typeof f === 'string') return f.trim().length > 0;
      if (typeof f === 'number') return true;
      if (Array.isArray(f)) return f.length > 0;
      if (typeof f === 'object' && f !== null) return Object.keys(f).length > 0;
      return !!f;
    }).length;
    
    return Math.round((filledCount / fields.length) * 100);
  }, [profile]);
  // ==================== END FIX ====================

  // Skeleton Loader
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-white to-orange-50/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded-lg w-1/3" />
            <div className="bg-white rounded-3xl p-8 space-y-6">
              <div className="flex gap-6">
                <div className="w-32 h-32 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-1/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            </div>
            <div className="h-12 bg-gray-200 rounded-xl" />
            <div className="bg-white rounded-3xl p-8 h-96" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const displayName = getDisplayName(profile);
  const userIdString = getUserIdString(profile.user);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-white to-orange-50/30 pb-24">
      {/* Top Navigation Bar */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-md border-b border-orange-100 sticky top-0 z-50"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05, x: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/employeedashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Home</span>
            </motion.button>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-xl font-bold text-gray-800">
              Job<span className="text-orange-500">Dekho</span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/employeedashboard')}
            className="px-6 py-2 rounded-xl bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 transition-colors"
          >
            Cancel
          </motion.button>
        </div>
      </motion.nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-500">{displayName}</p>
        </motion.div>

        {/* Main Profile Card */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-3xl shadow-xl shadow-orange-100/30 border border-orange-50 overflow-hidden mb-6"
        >
          <div className="p-6 sm:p-10">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left: Details */}
              <div className="flex-1 space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Details</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Employee ID', value: profile?.employeeId || 'Not set', icon: IdCard },
                      { label: 'Department', value: profile?.department || 'Not set', icon: Building2 },
                      { label: 'Designation', value: profile?.designation || 'Not set', icon: Briefcase },
                      { label: 'Reporting Manager', value: profile?.reportingManager || 'Not set', icon: UserCircle },
                      { label: 'Company Email', value: profile?.companyEmail || 'Not set', icon: Mail },
                    ].map((item, idx) => (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex flex-col"
                      >
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{item.label}</span>
                        <span className={`text-sm ${item.value === 'Not set' ? 'text-gray-300' : 'text-gray-500'}`}>
                          {item.value}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* About Me */}
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">About Me</h3>
                  <p className="text-gray-300 italic">
                    {profile?.about || 'No bio added yet. Click Edit Profile to add one.'}
                  </p>
                </div>

                {/* Profile Strength */}
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16">
                    <svg className="w-16 h-16 transform -rotate-90">
                      <circle cx="32" cy="32" r="28" stroke="#f1f5f9" strokeWidth="4" fill="none" />
                      <motion.circle
                        cx="32" cy="32" r="28"
                        stroke="url(#gradient)"
                        strokeWidth="4"
                        fill="none"
                        strokeLinecap="round"
                        initial={{ strokeDasharray: "0 176" }}
                        animate={{ strokeDasharray: `${profileStrength * 1.76} 176` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#f97316" />
                          <stop offset="100%" stopColor="#ea580c" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-orange-500">
                      {profileStrength}%
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Profile strength</h4>
                    <p className="text-sm text-gray-400">Complete your profile details</p>
                  </div>
                </div>

                {/* Edit Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={toggleEdit}
                  className={`px-8 py-3 rounded-xl font-semibold border-2 transition-all duration-300 ${
                    isEditing
                      ? 'border-orange-500 text-orange-600 hover:bg-orange-50'
                      : 'border-orange-500 text-orange-600 hover:bg-orange-50'
                  }`}
                >
                  {isEditing ? 'Cancel Editing' : 'Edit Profile'}
                </motion.button>
              </div>

              {/* Right: Orange Hero Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="w-full lg:w-80 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-8 text-white relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-8 -mb-8" />

                <div className="relative z-10 flex flex-col items-center text-center">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center mb-6 text-3xl font-bold"
                  >
                    {getInitials(displayName)}
                  </motion.div>

                  <p className="text-orange-100 text-sm font-medium mb-1">HELLO, I'M</p>
                  <h2 className="text-2xl font-bold mb-1">{displayName}</h2>
                  <p className="text-orange-100">{profile?.designation || 'Employee'}</p>

                  <div className="flex gap-4 mt-6">
                    {['Resume', 'Docs', 'Bio'].map((item) => (
                      <div key={item} className="flex flex-col items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-orange-300/50" />
                        <span className="text-xs text-orange-200">{item}</span>
                      </div>
                    ))}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="mt-6 px-6 py-2.5 bg-white text-orange-600 rounded-xl font-semibold text-sm hover:bg-orange-50 transition-colors"
                  >
                    Upload Photo
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Tabs Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg shadow-orange-100/20 border border-orange-50 p-2 mb-6"
        >
          <div className="flex overflow-x-auto gap-1 scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm whitespace-nowrap transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-200'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-orange-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={tabContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white rounded-3xl shadow-xl shadow-orange-100/30 border border-orange-50 overflow-hidden"
          >
            <div className="p-6 sm:p-8 border-b border-orange-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm">
                  {tabs.findIndex(t => t.id === activeTab) + 1}
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                  {tabs.find(t => t.id === activeTab)?.label}
                </h2>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              {activeTab === 'basic' && (
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Employee ID - Locked */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Employee ID</label>
                      <div className="relative">
                        <input type="text" value={profile?.employeeId || ''} disabled
                          className="w-full px-4 py-3.5 bg-gray-50 rounded-xl border border-gray-200 text-gray-400 cursor-not-allowed" />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-300 uppercase">Locked</span>
                      </div>
                    </motion.div>

                    {/* Company - Locked */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Company</label>
                      <div className="relative">
                        <input type="text" value={profile?.company || ''} disabled
                          className="w-full px-4 py-3.5 bg-gray-50 rounded-xl border border-gray-200 text-gray-400 cursor-not-allowed" />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-300 uppercase">Locked</span>
                      </div>
                    </motion.div>

                    {/* Department - Locked */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Department</label>
                      <div className="relative">
                        <input type="text" value={profile?.department || ''} disabled
                          className="w-full px-4 py-3.5 bg-gray-50 rounded-xl border border-gray-200 text-gray-400 cursor-not-allowed" />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-300 uppercase">Locked</span>
                      </div>
                    </motion.div>

                    {/* Designation - Locked */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Designation</label>
                      <div className="relative">
                        <input type="text" value={profile?.designation || ''} disabled
                          className="w-full px-4 py-3.5 bg-gray-50 rounded-xl border border-gray-200 text-gray-400 cursor-not-allowed" />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-300 uppercase">Locked</span>
                      </div>
                    </motion.div>

                    {/* Joining Date - Locked */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Joining Date</label>
                      <div className="relative">
                        <input type="text" value={formatDate(profile?.joiningDate)} disabled
                          className="w-full px-4 py-3.5 bg-gray-50 rounded-xl border border-gray-200 text-gray-400 cursor-not-allowed" />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-300 uppercase">Locked</span>
                      </div>
                    </motion.div>

                    {/* Reporting Manager - Locked */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Reporting Manager</label>
                      <div className="relative">
                        <input type="text" value={profile?.reportingManager || ''} disabled
                          className="w-full px-4 py-3.5 bg-gray-50 rounded-xl border border-gray-200 text-gray-400 cursor-not-allowed" />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-300 uppercase">Locked</span>
                      </div>
                    </motion.div>
                  </div>

                  {/* Read-only Info Cards */}
                  <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-orange-50">
                    {[
                      { label: 'Employment Status', value: profile?.employmentStatus || 'active', icon: Activity, color: 'green' },
                      { label: 'User ID', value: userIdString ? userIdString.substring(0, 8) + '...' : 'N/A', icon: Shield, color: 'blue' },
                      { label: 'Company Email', value: profile?.companyEmail ? 'Verified' : 'Pending', icon: CheckCircle2, color: 'orange' },
                      { label: 'Personal Email', value: profile?.personalEmail ? 'Added' : 'Not Added', icon: Mail, color: 'purple' }
                    ].map((item) => {
                      const Icon = item.icon;
                      const colorMap = {
                        blue: 'bg-blue-50 text-blue-600 border-blue-100',
                        purple: 'bg-purple-50 text-purple-600 border-purple-100',
                        green: 'bg-green-50 text-green-600 border-green-100',
                        orange: 'bg-orange-50 text-orange-600 border-orange-100'
                      };
                      return (
                        <div key={item.label} className={`p-4 rounded-xl border ${colorMap[item.color]}`}>
                          <Icon className="w-5 h-5 mb-2" />
                          <p className="text-xs font-bold uppercase tracking-wider opacity-70">{item.label}</p>
                          <p className="font-semibold capitalize">{item.value}</p>
                        </div>
                      );
                    })}
                  </motion.div>

                  {/* Dates */}
                  <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-orange-50/50 rounded-xl">
                      <CalendarDays className="w-5 h-5 text-orange-500" />
                      <div>
                        <p className="text-xs text-gray-500">Joined</p>
                        <p className="font-semibold text-gray-800">{formatDate(profile?.joiningDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-orange-50/50 rounded-xl">
                      <Clock className="w-5 h-5 text-orange-500" />
                      <div>
                        <p className="text-xs text-gray-500">Profile Created</p>
                        <p className="font-semibold text-gray-800">{formatDate(profile?.createdAt)}</p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {activeTab === 'employment' && (
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div variants={itemVariants} className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Employee ID</label>
                      <input type="text" value={profile?.employeeId || ''} disabled
                        className="w-full px-4 py-3.5 bg-gray-50 rounded-xl border border-gray-200 text-gray-400 cursor-not-allowed" />
                    </motion.div>

                    <motion.div variants={itemVariants} className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Company</label>
                      <input type="text" value={profile?.company || ''} disabled
                        className="w-full px-4 py-3.5 bg-gray-50 rounded-xl border border-gray-200 text-gray-400 cursor-not-allowed" />
                    </motion.div>

                    <motion.div variants={itemVariants} className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Department</label>
                      <input type="text" value={profile?.department || ''} disabled
                        className="w-full px-4 py-3.5 bg-gray-50 rounded-xl border border-gray-200 text-gray-400 cursor-not-allowed" />
                    </motion.div>

                    <motion.div variants={itemVariants} className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Designation</label>
                      <input type="text" value={profile?.designation || ''} disabled
                        className="w-full px-4 py-3.5 bg-gray-50 rounded-xl border border-gray-200 text-gray-400 cursor-not-allowed" />
                    </motion.div>

                    <motion.div variants={itemVariants} className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Reporting Manager</label>
                      <input type="text" value={profile?.reportingManager || ''} disabled
                        className="w-full px-4 py-3.5 bg-gray-50 rounded-xl border border-gray-200 text-gray-400 cursor-not-allowed" />
                    </motion.div>

                    <motion.div variants={itemVariants} className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Employment Status</label>
                      <div className="flex items-center gap-2 px-4 py-3.5 bg-gray-50 rounded-xl border border-gray-200">
                        <div className={`w-2 h-2 rounded-full ${profile?.employmentStatus === 'active' ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-gray-600 capitalize">{profile?.employmentStatus || 'active'}</span>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'contact' && (
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Phone - Editable */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Phone {isEditing && <span className="text-red-500">*</span>}
                      </label>
                      <input type="tel" name="phone"
                        value={isEditing ? formData.phone : profile?.phone || ''}
                        onChange={handleChange} disabled={!isEditing} placeholder="+1 555 0123"
                        className={`w-full px-4 py-3.5 rounded-xl border transition-all duration-300 ${
                          isEditing ? 'bg-white border-orange-200 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 text-gray-800'
                            : 'bg-gray-50 border-gray-200 text-gray-600'
                        }`} />
                      {errors.phone && <p className="text-sm text-red-500 flex items-center gap-1"><AlertCircle size={14} />{errors.phone}</p>}
                    </motion.div>

                    {/* Personal Email - Locked */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Personal Email</label>
                      <div className="relative">
                        <input type="email" value={profile?.personalEmail || ''} disabled
                          className="w-full px-4 py-3.5 bg-gray-50 rounded-xl border border-gray-200 text-gray-400 cursor-not-allowed" />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-300 uppercase">Locked</span>
                      </div>
                    </motion.div>

                    {/* Company Email - Locked */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Company Email</label>
                      <div className="relative">
                        <input type="email" value={profile?.companyEmail || ''} disabled
                          className="w-full px-4 py-3.5 bg-gray-50 rounded-xl border border-gray-200 text-gray-400 cursor-not-allowed" />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-300 uppercase">Locked</span>
                      </div>
                    </motion.div>

                    {/* Address - Editable */}
                    <motion.div variants={itemVariants} className="space-y-2 md:col-span-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Address {isEditing && <span className="text-red-500">*</span>}
                      </label>
                      <textarea name="address" rows={3}
                        value={isEditing ? formData.address : profile?.address || ''}
                        onChange={handleChange} disabled={!isEditing} placeholder="Enter your full address"
                        className={`w-full px-4 py-3.5 rounded-xl border transition-all duration-300 resize-none ${
                          isEditing ? 'bg-white border-orange-200 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 text-gray-800'
                            : 'bg-gray-50 border-gray-200 text-gray-600'
                        }`} />
                      {errors.address && <p className="text-sm text-red-500 flex items-center gap-1"><AlertCircle size={14} />{errors.address}</p>}
                    </motion.div>

                    {/* Emergency Contact - Editable */}
                    <motion.div variants={itemVariants} className="space-y-2 md:col-span-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Emergency Contact {isEditing && <span className="text-red-500">*</span>}
                      </label>
                      <input type="text" name="emergencyContact"
                        value={isEditing ? formData.emergencyContact : profile?.emergencyContact || ''}
                        onChange={handleChange} disabled={!isEditing} placeholder="Name - Relation - Phone"
                        className={`w-full px-4 py-3.5 rounded-xl border transition-all duration-300 max-w-md ${
                          isEditing ? 'bg-white border-orange-200 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 text-gray-800'
                            : 'bg-gray-50 border-gray-200 text-gray-600'
                        }`} />
                      {errors.emergencyContact && <p className="text-sm text-red-500 flex items-center gap-1"><AlertCircle size={14} />{errors.emergencyContact}</p>}
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'documents' && (
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">No documents uploaded yet</p>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors">
                    <Upload className="w-4 h-4 inline mr-2" />
                    Upload Document
                  </motion.button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Sticky Bottom Action Bar */}
      <AnimatePresence>
        {(hasChanges || isEditing) && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="bg-white rounded-2xl shadow-2xl shadow-orange-200/50 border border-orange-100 px-6 py-4 flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                <span className="font-semibold text-gray-800">Unsaved changes</span>
              </div>

              <div className="flex gap-3">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleDiscard}
                  className="px-6 py-2.5 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                  Discard
                </motion.button>

                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleSave} disabled={saving}
                  className={`px-6 py-2.5 rounded-xl font-semibold text-white flex items-center gap-2 transition-all ${
                    saving ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-200'
                  }`}>
                  {saving ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />Saving...</>
                  ) : (
                    <><Save className="w-4 h-4" />Save Changes</>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileEM;