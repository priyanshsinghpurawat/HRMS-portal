import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  UserPlus,
  User,
  Mail,
  Building2,
  Briefcase,
  Phone,
  Users,
  CalendarDays,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

// ✅ Centralized auth utilities and API instance
import { getToken, handleApiError } from "../../../../../utils/api";
import api from "../../../axiosInstance";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1, y: 0,
    transition: { type: "spring", stiffness: 100, damping: 12 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: "spring", stiffness: 80, damping: 15, delay: 0.2 }
  }
};

const buttonVariants = {
  hover: { scale: 1.02, y: -2 },
  tap: { scale: 0.98 },
  disabled: { scale: 1, y: 0 }
};

const CreateEmployee = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    personalEmail: '',
    department: '',
    designation: '',
    phone: '',
    reportingManager: '',
    joiningDate: ''
  });

  const departments = ['Engineering', 'HR', 'Marketing', 'Finance', 'Sales', 'Support'];

  const managers = [
    { id: '60d5ec49c6158e00155b4121', name: 'HR Manager' },
    { id: '60d5ec49c6158e00155b4122', name: 'Tech Lead' },
    { id: '60d5ec49c6158e00155b4123', name: 'Senior Manager' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => { const newErrors = { ...prev }; delete newErrors[name]; return newErrors; });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    else if (formData.name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';

    if (!formData.personalEmail.trim()) newErrors.personalEmail = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.personalEmail)) newErrors.personalEmail = 'Please enter a valid email';

    if (!formData.department) newErrors.department = 'Please select a department';
    if (!formData.designation.trim()) newErrors.designation = 'Designation is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\+?[\d\s-]{10,}$/.test(formData.phone.replace(/\s/g, ''))) newErrors.phone = 'Please enter a valid phone number';
    if (!formData.reportingManager) newErrors.reportingManager = 'Please select a reporting manager';
    if (!formData.joiningDate) newErrors.joiningDate = 'Joining date is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the errors in the form', {
        icon: <AlertCircle className="w-5 h-5 text-red-500" />
      });
      return;
    }

    setIsLoading(true);

    try {
      // ✅ Check token using auth helper
      const token = getToken();
      if (!token) {
        toast.error("Please login again", { position: "top-center" });
        navigate("/company-login", { replace: true });
        return;
      }

      // ✅ Use centralized API instance (auto-injects Bearer token)
      await api.post("/employees", {
        name: formData.name.trim(),
        personalEmail: formData.personalEmail.trim(),
        department: formData.department,
        designation: formData.designation.trim(),
        phone: formData.phone.trim(),
        reportingManager: formData.reportingManager,
        joiningDate: formData.joiningDate
      });

      toast.success('Employee Created Successfully', {
        duration: 4000,
        icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
        style: { border: '1px solid #10B981', padding: '16px', color: '#10B981' }
      });

      // Reset form
      setFormData({ name: '', personalEmail: '', department: '', designation: '', phone: '', reportingManager: '', joiningDate: '' });
      setErrors({});

    } catch (error) {
      console.error('Error creating employee:', error);

      // ✅ Centralized session expiry handling
      const wasSessionExpired = handleApiError(error, navigate, toast);

      if (!wasSessionExpired) {
        const errorMessage = error.response?.data?.message || 
                            error.response?.data?.error || 
                            'Failed to create employee. Please try again.';
        toast.error(errorMessage, { duration: 5000, icon: <AlertCircle className="w-5 h-5 text-red-500" /> });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses = (fieldName) => `
    w-full pl-11 pr-4 py-3.5 bg-white/80 backdrop-blur-sm 
    border rounded-xl text-gray-800 placeholder-gray-400
    transition-all duration-300 ease-out
    focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400
    hover:border-orange-200
    ${errors[fieldName] ? 'border-red-300 focus:ring-red-200 focus:border-red-400 bg-red-50/50' : 'border-orange-100/80'}
  `;

  const labelClasses = "block text-sm font-semibold text-gray-700 mb-2";
  const iconClasses = "absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none";

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50/30">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/80 backdrop-blur-md border-b border-orange-100 sticky top-0 z-40"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05, x: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/hrdashboard')}
              className="p-2.5 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-200"
              >
                <UserPlus className="w-5 h-5 text-white" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Create Employee</h1>
                <p className="text-sm text-gray-500">Add a new employee to your organization</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl shadow-orange-100/40 border border-orange-100/60 overflow-hidden"
        >
          <div className="h-2 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600" />
          <div className="p-6 sm:p-10">
            <motion.form
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div variants={itemVariants} className="space-y-1">
                  <label className={labelClasses}>Full Name <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <User className={iconClasses} size={18} />
                    <input type="text" name="name" value={formData.name} onChange={handleChange}
                      placeholder="Enter employee full name" className={inputClasses('name')} disabled={isLoading} />
                  </div>
                  {errors.name && <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-500 flex items-center gap-1 mt-1"><AlertCircle size={14} />{errors.name}</motion.p>}
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-1">
                  <label className={labelClasses}>Personal Email <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Mail className={iconClasses} size={18} />
                    <input type="email" name="personalEmail" value={formData.personalEmail} onChange={handleChange}
                      placeholder="Enter personal email" className={inputClasses('personalEmail')} disabled={isLoading} />
                  </div>
                  {errors.personalEmail && <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-500 flex items-center gap-1 mt-1"><AlertCircle size={14} />{errors.personalEmail}</motion.p>}
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-1">
                  <label className={labelClasses}>Department <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Building2 className={iconClasses} size={18} />
                    <select name="department" value={formData.department} onChange={handleChange}
                      className={`${inputClasses('department')} appearance-none cursor-pointer`} disabled={isLoading}>
                      <option value="" disabled>Select department</option>
                      {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                    </select>
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  {errors.department && <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-500 flex items-center gap-1 mt-1"><AlertCircle size={14} />{errors.department}</motion.p>}
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-1">
                  <label className={labelClasses}>Designation <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Briefcase className={iconClasses} size={18} />
                    <input type="text" name="designation" value={formData.designation} onChange={handleChange}
                      placeholder="e.g. Software Engineer" className={inputClasses('designation')} disabled={isLoading} />
                  </div>
                  {errors.designation && <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-500 flex items-center gap-1 mt-1"><AlertCircle size={14} />{errors.designation}</motion.p>}
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-1">
                  <label className={labelClasses}>Phone Number <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Phone className={iconClasses} size={18} />
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                      placeholder="+1 555 0123" className={inputClasses('phone')} disabled={isLoading} />
                  </div>
                  {errors.phone && <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-500 flex items-center gap-1 mt-1"><AlertCircle size={14} />{errors.phone}</motion.p>}
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-1">
                  <label className={labelClasses}>Reporting Manager <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Users className={iconClasses} size={18} />
                    <select name="reportingManager" value={formData.reportingManager} onChange={handleChange}
                      className={`${inputClasses('reportingManager')} appearance-none cursor-pointer`} disabled={isLoading}>
                      <option value="" disabled>Select manager</option>
                      {managers.map(manager => <option key={manager.id} value={manager.id}>{manager.name}</option>)}
                    </select>
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  {errors.reportingManager && <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-500 flex items-center gap-1 mt-1"><AlertCircle size={14} />{errors.reportingManager}</motion.p>}
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-1 md:col-span-2">
                  <label className={labelClasses}>Joining Date <span className="text-red-500">*</span></label>
                  <div className="relative max-w-md">
                    <CalendarDays className={iconClasses} size={18} />
                    <input type="date" name="joiningDate" value={formData.joiningDate} onChange={handleChange}
                      className={inputClasses('joiningDate')} disabled={isLoading} />
                  </div>
                  {errors.joiningDate && <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-500 flex items-center gap-1 mt-1"><AlertCircle size={14} />{errors.joiningDate}</motion.p>}
                </motion.div>
              </div>

              <motion.div variants={itemVariants} className="border-t border-orange-100 my-8" />

              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
                <motion.button type="submit" variants={buttonVariants}
                  whileHover={!isLoading ? "hover" : "disabled"}
                  whileTap={!isLoading ? "tap" : "disabled"}
                  disabled={isLoading}
                  className={`flex-1 py-4 px-8 rounded-xl font-semibold text-white flex items-center justify-center gap-3 transition-all duration-300 ${
                    isLoading ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300/50'
                  }`}>
                  {isLoading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /><span>Creating...</span></>
                  ) : (
                    <><UserPlus className="w-5 h-5" /><span>Create Employee</span></>
                  )}
                </motion.button>

                <motion.button type="button" variants={buttonVariants}
                  whileHover="hover" whileTap="tap"
                  onClick={() => navigate('/hrdashboard')} disabled={isLoading}
                  className="py-4 px-8 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors duration-200">
                  Cancel
                </motion.button>
              </motion.div>
            </motion.form>
          </div>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
          className="text-center text-sm text-gray-400 mt-8">
          All fields marked with <span className="text-red-500">*</span> are required
        </motion.p>
      </div>
    </div>
  );
};

export default CreateEmployee;