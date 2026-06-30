import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import {
  X,
  Upload,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Trash2
} from 'lucide-react';

const BASE_URL = window.API_BASE_URL;

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } },
  exit: { opacity: 0, scale: 0.9, y: 20, transition: { duration: 0.2 } }
};

const ApplyModal = ({ isOpen, onClose, jobId, jobTitle, onSuccess, onAlreadyApplied }) => {
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const ALLOWED_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

  const validateFile = (file) => {
    if (!file) return 'Resume is required';
    if (file.size > MAX_FILE_SIZE) return 'File size must be less than 5MB';
    if (!ALLOWED_TYPES.includes(file.type)) return 'Only PDF, DOC, DOCX files allowed';
    return null;
  };

  const handleFileChange = (file) => {
    const error = validateFile(file);
    if (error) {
      setErrors(prev => ({ ...prev, resume: error }));
      setResumeFile(null);
      return;
    }
    setResumeFile(file);
    setErrors(prev => { const n = { ...prev }; delete n.resume; return n; });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileChange(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!coverLetter.trim()) newErrors.coverLetter = 'Cover letter is required';
    if (!resumeFile) newErrors.resume = 'Resume is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fill all required fields', { icon: <AlertCircle className="w-5 h-5 text-red-500" /> });
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading('Submitting application...');

    try {
      const token = Cookies.get("jobdekho_token");
      if (!token) {
        toast.error('Please login again', { id: toastId });
        onClose();
        return;
      }

      const formData = new FormData();
      formData.append('coverLetter', coverLetter);
      formData.append('resume', resumeFile);

      await axios.post(
        `${BASE_URL}/jobs/${jobId}/apply`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      toast.success('Application submitted successfully!', {
        id: toastId,
        icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
        duration: 4000
      });

      onSuccess();
      onClose();
      setCoverLetter('');
      setResumeFile(null);
      setErrors({});

    } catch (error) {
      console.error('Apply Error:', error);
      const status = error?.response?.status;
      const message = error?.response?.data?.message || '';

      if (status === 401) {
        toast.error('Please login again', { id: toastId });
      } else if (status === 403) {
        toast.error('Profile incomplete. Please complete your profile first.', { id: toastId });
      } else if (status === 400) {
        toast.error(message || 'Resume required', { id: toastId });
      } else if (status === 409) {
        // CRITICAL FIX: Already applied - notify parent and close
        toast.error('You already applied to this job', { id: toastId });
        onAlreadyApplied(); // Tell parent to mark as applied
        onClose();
      } else {
        toast.error(message || 'Something went wrong', { id: toastId });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      onClose();
      setCoverLetter('');
      setResumeFile(null);
      setErrors({});
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-orange-100 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Apply for Job</h2>
                <p className="text-sm text-gray-500 truncate max-w-[250px]">{jobTitle}</p>
              </div>
              <button
                onClick={handleClose}
                disabled={submitting}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2 block">
                  Cover Letter <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => {
                    setCoverLetter(e.target.value);
                    if (errors.coverLetter) setErrors(prev => { const n = { ...prev }; delete n.coverLetter; return n; });
                  }}
                  placeholder="Write your cover letter... Tell us why you're a great fit for this role."
                  rows={5}
                  disabled={submitting}
                  className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 resize-none focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 ${
                    errors.coverLetter ? 'border-red-300 bg-red-50/30' : 'border-gray-200 hover:border-orange-200'
                  }`}
                />
                {errors.coverLetter && <p className="text-xs text-red-500 mt-1">{errors.coverLetter}</p>}
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2 block">
                  Resume <span className="text-red-500">*</span>
                </label>

                {!resumeFile ? (
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
                      isDragging
                        ? 'border-orange-500 bg-orange-50'
                        : errors.resume
                          ? 'border-red-300 bg-red-50/30'
                          : 'border-gray-300 hover:border-orange-400 hover:bg-orange-50/50'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => e.target.files[0] && handleFileChange(e.target.files[0])}
                      className="hidden"
                    />
                    <Upload className={`w-10 h-10 mx-auto mb-3 ${isDragging ? 'text-orange-500' : 'text-gray-400'}`} />
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      {isDragging ? 'Drop your resume here' : 'Drag & drop your resume'}
                    </p>
                    <p className="text-xs text-gray-400">or click to browse</p>
                    <p className="text-xs text-gray-400 mt-2">PDF, DOC, DOCX (max 5MB)</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-xl border border-orange-200">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{resumeFile.name}</p>
                      <p className="text-xs text-gray-500">{(resumeFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setResumeFile(null); setErrors(prev => { const n = { ...prev }; delete n.resume; return n; }); }}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {errors.resume && <p className="text-xs text-red-500 mt-1">{errors.resume}</p>}
              </div>

              <motion.button
                type="submit"
                whileHover={!submitting ? { scale: 1.02 } : {}}
                whileTap={!submitting ? { scale: 0.98 } : {}}
                disabled={submitting}
                className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all shadow-lg ${
                  submitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-orange-200'
                }`}
              >
                {submitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" />Submitting...</>
                ) : (
                  <><CheckCircle2 className="w-5 h-5" />Apply Now</>
                )}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ApplyModal;