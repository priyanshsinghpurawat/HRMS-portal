import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  MapPin,
  DollarSign,
  Briefcase,
  Clock,
  Building2,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Zap,
  Globe,
  CheckCircle2
} from 'lucide-react';

const JobCard = ({ job, index, isSaved, onToggleSave, onApplyClick }) => {
  const navigate = useNavigate();

  const formatSalary = (min, max) => {
    if (!min && !max) return 'Salary not disclosed';
    const format = (val) => val >= 100000 ? `${(val/100000).toFixed(0)}L` : `${(val/1000).toFixed(0)}K`;
    return `₹${format(min)} - ₹${format(max)}`;
  };

  const formatDate = (date) => {
    if (!date) return '';
    const posted = new Date(date);
    const now = new Date();
    const diff = Math.floor((now - posted) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return `${diff} days ago`;
    if (diff < 30) return `${Math.floor(diff/7)} weeks ago`;
    return posted.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isRemote = job.location?.toLowerCase().includes('remote');
  const isUrgent = job.openings <= 2 || job.isUrgent;
  const isFeatured = job.isFeatured;


  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 100, damping: 15 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="group bg-white rounded-2xl border border-orange-100/60 shadow-sm hover:shadow-xl hover:shadow-orange-100/40 transition-all duration-300 overflow-hidden"
    >
      {isFeatured && <div className="h-1 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600" />}

      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-orange-200 flex-shrink-0">
              {job.company?.name?.charAt(0).toUpperCase() || job.title?.charAt(0).toUpperCase() || 'J'}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-gray-900 text-base leading-tight truncate group-hover:text-orange-600 transition-colors">
                {job.title}
              </h3>
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                <Building2 className="w-3.5 h-3.5" />
                {job.company?.name || 'JobDekho'}
              </p>
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleSave(job._id); }}
            className="p-2 rounded-lg hover:bg-orange-50 transition-colors flex-shrink-0"
          >
            {isSaved ? (
              <BookmarkCheck className="w-5 h-5 text-orange-500" />
            ) : (
              <Bookmark className="w-5 h-5 text-gray-400 hover:text-orange-500 transition-colors" />
            )}
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          {isRemote && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Globe className="w-3 h-3" /> Remote
            </span>
          )}
          {isUrgent && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
              <Zap className="w-3 h-3" /> Urgent Hiring
            </span>
          )}
          {isFeatured && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">
              <Zap className="w-3 h-3" /> Featured
            </span>
          )}
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            {job.department}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="truncate">{job.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <DollarSign className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="truncate">{formatSalary(job.salaryMin, job.salaryMax)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Briefcase className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="truncate">{job.experienceLevel}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="truncate">{job.employmentType?.replace('-', ' ')}</span>
          </div>
        </div>

        <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">
          {job.description}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-400 font-medium">
            Posted {formatDate(job.createdAt)}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/jobportal/alljobs/${job._id}`)}
              className="px-4 py-2 text-sm font-semibold text-orange-600 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors flex items-center gap-1"
            >
              View Details <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => navigate(`/jobportal/alljobs/${job._id}`)}
              className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-md shadow-orange-200"
            >
              Apply Now
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default JobCard;