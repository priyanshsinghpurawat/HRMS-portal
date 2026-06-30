import React, { useState, useEffect } from 'react';
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
  Upload
} from 'lucide-react';

// ✅ Centralized auth utilities and API instance
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

const HrProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [hasChanges, setHasChanges] = useState(false);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    designation: '',
    phone: '',
    personalEmail: ''
  });
  const [errors, setErrors] = useState({});

  const tabs = [
    { id: 'basic', label: 'Basic Details', icon: User },
    { id: 'location', label: 'Location', icon: MapPin },
    { id: 'languages', label: 'Languages', icon: Languages },
    { id: 'social', label: 'Social Links', icon: Link2 },
    { id: 'resume', label: 'Resume', icon: FileText }
  ];

  // ✅ Fetch profile using centralized API instance
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);

    try {
      // ✅ Check token using auth helper
      const token = getToken();
      if (!token) {
        toast.error("Please login again", { position: "top-center" });
        clearAuth();
        navigate("/company-login", { replace: true });
        return;
      }

      // ✅ Use centralized API instance (auto-injects Bearer token)
      const { data } = await api.get("/hr/profile");

      const profileData = data.data;
      setProfile(profileData);
      setFormData({
        designation: profileData.designation || "",
        phone: profileData.phone || "",
        personalEmail: profileData.personalEmail || "",
      });

    } catch (error) {
      console.error("Profile Error:", error);

      // ✅ Centralized session expiry handling
      const wasSessionExpired = handleApiError(error, navigate, toast);

      // Only show generic error if not session expiry (already handled)
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
    if (!formData.personalEmail.trim()) {
      newErrors.personalEmail = 'Personal email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.personalEmail)) {
      newErrors.personalEmail = 'Please enter a valid email';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-]{10,}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    if (!formData.designation.trim()) {
      newErrors.designation = 'Designation is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Save profile using centralized API instance
  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors before saving');
      return;
    }

    setSaving(true);
    try {
      // ✅ API instance auto-injects token, no manual headers needed
      const { data } = await api.put("/hr/profile", {
        designation: formData.designation,
        phone: formData.phone,
        personalEmail: formData.personalEmail
      });

      // ✅ Instant UI update - no reload
      setProfile(prev => ({
        ...prev,
        designation: formData.designation,
        phone: formData.phone,
        personalEmail: formData.personalEmail
      }));

      setHasChanges(false);
      setIsEditing(false);
      toast.success('Profile updated successfully', {
        icon: <CheckCircle2 className="w-5 h-5 text-green-500" />
      });
    } catch (error) {
      console.error('Error updating profile:', error);

      // ✅ Centralized session expiry handling
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
      designation: profile?.designation || '',
      phone: profile?.phone || '',
      personalEmail: profile?.personalEmail || ''
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
        designation: profile?.designation || '',
        phone: profile?.phone || '',
        personalEmail: profile?.personalEmail || ''
      });
    } else {
      setIsEditing(true);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

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

  const profileStrength = 35;

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
              onClick={() => navigate('/hrdashboard')}
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
            onClick={() => navigate('/hrdashboard')}
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Profile</h1>
          <p className="text-gray-500">{profile?.user?.name || 'm'}</p>
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
                      { label: 'Name', value: profile?.user?.name || 'Not set', icon: User },
                      { label: 'Email', value: profile?.user?.email || 'Not set', icon: Mail },
                      { label: 'Experience', value: profile?.experience || 'Not set', icon: Briefcase },
                      { label: 'Location', value: profile?.location || 'Not set', icon: MapPin },
                      { label: 'Gender', value: profile?.gender || 'Not set', icon: User },
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
                    <p className="text-sm text-gray-400">Complete basic profile details</p>
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
                    {getInitials(profile?.user?.name)}
                  </motion.div>

                  <p className="text-orange-100 text-sm font-medium mb-1">HELLO, I'M</p>
                  <h2 className="text-2xl font-bold mb-1">{profile?.user?.name || 'Your Name'}</h2>
                  <p className="text-orange-100">{profile?.designation || 'm'}</p>

                  <div className="flex gap-4 mt-6">
                    {['Resume', 'Links', 'Bio'].map((item) => (
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
                    {/* Full Name - Locked */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Full Name</label>
                      <div className="relative">
                        <input type="text" value={profile?.user?.name || ''} disabled
                          className="w-full px-4 py-3.5 bg-gray-50 rounded-xl border border-gray-200 text-gray-400 cursor-not-allowed" />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-300 uppercase">Locked</span>
                      </div>
                    </motion.div>

                    {/* Email - Locked */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email</label>
                      <div className="relative">
                        <input type="email" value={profile?.user?.email || ''} disabled
                          className="w-full px-4 py-3.5 bg-gray-50 rounded-xl border border-gray-200 text-gray-400 cursor-not-allowed" />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-300 uppercase">Locked</span>
                      </div>
                    </motion.div>

                    {/* Designation - Editable */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Job Title {isEditing && <span className="text-red-500">*</span>}
                      </label>
                      <input type="text" name="designation"
                        value={isEditing ? formData.designation : profile?.designation || ''}
                        onChange={handleChange} disabled={!isEditing} placeholder="Enter designation"
                        className={`w-full px-4 py-3.5 rounded-xl border transition-all duration-300 ${
                          isEditing ? 'bg-white border-orange-200 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 text-gray-800'
                            : 'bg-gray-50 border-gray-200 text-gray-600'
                        }`} />
                      {errors.designation && <p className="text-sm text-red-500 flex items-center gap-1"><AlertCircle size={14} />{errors.designation}</p>}
                    </motion.div>

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

                    {/* Personal Email - Editable */}
                    <motion.div variants={itemVariants} className="space-y-2 md:col-span-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Personal Email {isEditing && <span className="text-red-500">*</span>}
                      </label>
                      <input type="email" name="personalEmail"
                        value={isEditing ? formData.personalEmail : profile?.personalEmail || ''}
                        onChange={handleChange} disabled={!isEditing} placeholder="name@example.com"
                        className={`w-full px-4 py-3.5 rounded-xl border transition-all duration-300 max-w-md ${
                          isEditing ? 'bg-white border-orange-200 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 text-gray-800'
                            : 'bg-gray-50 border-gray-200 text-gray-600'
                        }`} />
                      {errors.personalEmail && <p className="text-sm text-red-500 flex items-center gap-1"><AlertCircle size={14} />{errors.personalEmail}</p>}
                    </motion.div>
                  </div>

                  {/* Read-only Info Cards */}
                  <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-orange-50">
                    {[
                      { label: 'Role', value: profile?.user?.role || 'user', icon: Shield, color: 'blue' },
                      { label: 'Category', value: profile?.category || 'technical', icon: Briefcase, color: 'purple' },
                      { label: 'Status', value: profile?.user?.accountStatus || 'active', icon: CheckCircle2, color: 'green' },
                      { label: 'Verified', value: profile?.user?.isVerified ? 'Yes' : 'No', icon: Shield, color: 'orange' }
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
                        <p className="font-semibold text-gray-800">{formatDate(profile?.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-orange-50/50 rounded-xl">
                      <Clock className="w-5 h-5 text-orange-500" />
                      <div>
                        <p className="text-xs text-gray-500">Last Login</p>
                        <p className="font-semibold text-gray-800">{formatDate(profile?.user?.lastLogin)}</p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {activeTab === 'location' && (
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="text-center py-12">
                  <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-400">Location details not available</p>
                </motion.div>
              )}

              {activeTab === 'languages' && (
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="text-center py-12">
                  <Languages className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-400">No languages added yet</p>
                </motion.div>
              )}

              {activeTab === 'social' && (
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
                  <h3 className="text-lg font-bold text-gray-800">Social & Portfolio Links</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {['LinkedIn', 'GitHub', 'Portfolio Website', 'Twitter / X', 'Blog'].map((label) => (
                      <motion.div key={label} variants={itemVariants} className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">https://</span>
                          <input type="url" disabled={!isEditing} placeholder=""
                            className={`w-full pl-20 pr-4 py-3.5 rounded-xl border transition-all duration-300 ${
                              isEditing ? 'bg-white border-orange-200 focus:ring-2 focus:ring-orange-400'
                                : 'bg-gray-50 border-gray-200 text-gray-400'
                            }`} />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'resume' && (
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">No resume uploaded</p>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors">
                    <Upload className="w-4 h-4 inline mr-2" />
                    Upload Resume
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

export default HrProfile;