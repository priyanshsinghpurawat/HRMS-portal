import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../../../assets/img/pngLogo.png';
import {
  Search, Filter, X, MapPin, Building2, Briefcase, Clock,
  ChevronLeft, ChevronRight, Loader2, SlidersHorizontal,
  Bookmark, ArrowUpDown, AlertCircle
} from 'lucide-react';
import JobCard from './JobCard';
import ApplyModal from './ApplyModal';

const BASE_URL = window.API_BASE_URL;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const mobileDrawerVariants = {
  hidden: { y: "100%" },
  visible: { y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
  exit: { y: "100%", transition: { duration: 0.3 } }
};

const filterConfig = {
  location: {
    label: 'Location', icon: MapPin,
    options: ['All', 'Jaipur', 'Ahmedabad', 'Bangalore', 'Pune', 'Remote', 'Delhi', 'Mumbai', 'Hyderabad', 'Chennai']
  },
  department: {
    label: 'Department', icon: Building2,
    options: ['All', 'MERN', 'Frontend', 'Backend', 'Engineering', 'Full Stack', 'Java', 'Python', 'DevOps', 'Mobile', 'Data Science']
  },
  employmentType: {
    label: 'Employment Type', icon: Briefcase,
    options: ['All', 'Full-time', 'Part-time', 'Internship', 'Contract']
  },
  experienceLevel: {
    label: 'Experience Level', icon: Clock,
    options: ['All', 'Fresher', 'Junior', 'Mid', 'Senior']
  }
};

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
};

// Helpers: map URL slug values back to dropdown display values
const matchOption = (urlValue, options) => {
  if (!urlValue) return 'All';
  // try exact match
  const exact = options.find(o => o.toLowerCase() === urlValue.toLowerCase());
  if (exact) return exact;
  // try slug match (full-time -> Full-time)
  const slug = options.find(o => o.toLowerCase().replace(' ', '-') === urlValue.toLowerCase());
  return slug || 'All';
};

const JobSkeleton = () => (
  <div className="animate-pulse bg-white rounded-2xl border border-gray-100 p-5">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-12 h-12 bg-gray-200 rounded-xl" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
    <div className="flex gap-2 mb-3">
      {[1, 2, 3].map(i => <div key={i} className="h-6 bg-gray-200 rounded-lg w-20" />)}
    </div>
    <div className="h-3 bg-gray-200 rounded w-full mb-2" />
    <div className="h-3 bg-gray-200 rounded w-2/3" />
  </div>
);

const EmptyState = ({ hasFilters, onClear }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-20 px-4">
    <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-6">
      <Search className="w-12 h-12 text-orange-300" />
    </div>
    <h3 className="text-xl font-bold text-gray-800 mb-2">No jobs found</h3>
    <p className="text-sm text-gray-400 text-center max-w-md mb-6">
      {hasFilters ? "Try adjusting your filters or search terms." : "No jobs available. Check back later."}
    </p>
    {hasFilters && (
      <button onClick={onClear}
        className="px-6 py-3 bg-orange-50 text-orange-600 rounded-xl font-semibold hover:bg-orange-100 transition-colors flex items-center gap-2">
        <X className="w-4 h-4" /> Clear All Filters
      </button>
    )}
  </motion.div>
);

const FilterChip = ({ label, value, onRemove }) => (
  <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-sm font-medium border border-orange-200">
    {label}: {value}
    <button onClick={onRemove} className="hover:text-orange-900"><X className="w-3.5 h-3.5" /></button>
  </motion.span>
);

const Alljobs = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Initialize from URL params (so SearchBar navigation works)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [filters, setFilters] = useState({
    location: matchOption(searchParams.get('location'), filterConfig.location.options),
    department: matchOption(searchParams.get('department'), filterConfig.department.options),
    employmentType: matchOption(searchParams.get('employmentType'), filterConfig.employmentType.options),
    experienceLevel: matchOption(searchParams.get('experienceLevel') || searchParams.get('experience'), filterConfig.experienceLevel.options),
  });

  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('latest');
  const [savedJobs, setSavedJobs] = useState(() => {
    const saved = localStorage.getItem('savedJobs');
    return saved ? JSON.parse(saved) : [];
  });
  const [applyModal, setApplyModal] = useState({ isOpen: false, job: null });
  const itemsPerPage = 12;

  const debouncedSearch = useDebounce(searchQuery, 400);

  // ✅ Sync state when URL params change (when SearchBar navigates here)
  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '');
    setFilters({
      location: matchOption(searchParams.get('location'), filterConfig.location.options),
      department: matchOption(searchParams.get('department'), filterConfig.department.options),
      employmentType: matchOption(searchParams.get('employmentType'), filterConfig.employmentType.options),
      experienceLevel: matchOption(searchParams.get('experienceLevel') || searchParams.get('experience'), filterConfig.experienceLevel.options),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // ✅ Keep URL in sync when filters/search change inside this page
  useEffect(() => {
    const params = {};
    if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
    if (filters.location !== 'All') params.location = filters.location;
    if (filters.department !== 'All') params.department = filters.department;
    if (filters.employmentType !== 'All') params.employmentType = filters.employmentType.toLowerCase().replace(' ', '-');
    if (filters.experienceLevel !== 'All') params.experienceLevel = filters.experienceLevel.toLowerCase();
    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, filters]);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.location !== 'All') params.location = filters.location;
      if (filters.department !== 'All') params.department = filters.department;
      if (filters.employmentType !== 'All') params.employmentType = filters.employmentType.toLowerCase().replace(' ', '-');
      if (filters.experienceLevel !== 'All') params.experienceLevel = filters.experienceLevel.toLowerCase();
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();

      const { data } = await axios.get(`${BASE_URL}/jobs`, { params });
      setJobs(data.data || []);
      setCurrentPage(1);
    } catch (error) {
      console.error('Fetch Jobs Error:', error);
      toast.error(error?.response?.data?.message || 'Failed to fetch jobs', { position: 'top-center' });
    } finally {
      setLoading(false);
    }
  }, [filters, debouncedSearch]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const sortedJobs = useMemo(() => {
    let filteredJobs = [...jobs];
    if (debouncedSearch.trim()) {
      const query = debouncedSearch.toLowerCase();
      filteredJobs = filteredJobs.filter((job) =>
        job.title?.toLowerCase().includes(query) ||
        job.company?.name?.toLowerCase().includes(query) ||
        job.location?.toLowerCase().includes(query) ||
        job.department?.toLowerCase().includes(query) ||
        job.employmentType?.toLowerCase().includes(query) ||
        job.experienceLevel?.toLowerCase().includes(query) ||
        job.description?.toLowerCase().includes(query) ||
        job.skills?.some(skill => skill.toLowerCase().includes(query))
      );
    }
    if (sortBy === 'latest') filteredJobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sortBy === 'salary-high') filteredJobs.sort((a, b) => (b.salaryMax || 0) - (a.salaryMax || 0));
    if (sortBy === 'salary-low') filteredJobs.sort((a, b) => (a.salaryMin || 0) - (b.salaryMin || 0));
    return filteredJobs;
  }, [jobs, sortBy, debouncedSearch]);

  const totalPages = Math.ceil(sortedJobs.length / itemsPerPage);
  const paginatedJobs = sortedJobs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleSaveJob = (jobId) => {
    setSavedJobs(prev => {
      const newSaved = prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId];
      localStorage.setItem('savedJobs', JSON.stringify(newSaved));
      toast.success(prev.includes(jobId) ? 'Job removed from saved' : 'Job saved successfully',
        { position: 'bottom-center', duration: 2000 });
      return newSaved;
    });
  };

  const handleApplyFromCard = (job) => {
    const token = localStorage.getItem('userToken');
    if (!token) {
      toast.error('Please login to apply for jobs', {
        position: 'top-center',
        icon: <AlertCircle className="w-5 h-5 text-orange-500" />
      });
      navigate('/login', { state: { redirectTo: `/jobs/${job._id}` } });
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem('userData') || '{}');
      const requiredFields = ['fullName', 'email', 'phone', 'profileImage', 'resume', 'skills', 'education', 'experience', 'currentLocation'];
      const missing = requiredFields.filter(field => !user[field] || (Array.isArray(user[field]) && user[field].length === 0));

      if (missing.length > 0) {
        toast.error('Please complete your profile before applying', {
          position: 'top-center', duration: 4000,
          icon: <AlertCircle className="w-5 h-5 text-orange-500" />
        });
        navigate('/u-profile', { state: { redirectTo: `/jobs/${job._id}`, missingFields: missing } });
        return;
      }
    } catch {
      toast.error('Please complete your profile before applying', { position: 'top-center' });
      navigate('/u-profile');
      return;
    }

    setApplyModal({ isOpen: true, job });
  };

  const handleApplySuccess = () => setApplyModal({ isOpen: false, job: null });

  const clearAllFilters = () => {
    setFilters({ location: 'All', department: 'All', employmentType: 'All', experienceLevel: 'All' });
    setSearchQuery('');
    setSearchParams({}, { replace: true });
  };

  const activeFilters = useMemo(() => {
    const chips = [];
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== 'All') chips.push({ key, label: filterConfig[key].label, value });
    });
    return chips;
  }, [filters]);

  const hasFilters = activeFilters.length > 0 || searchQuery.trim() !== '';

  const FilterContent = () => (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-orange-500" /> Filters
        </h3>
        {hasFilters && (
          <button onClick={clearAllFilters}
            className="text-sm text-orange-600 font-medium hover:text-orange-700 transition-colors">Clear All</button>
        )}
      </div>
      {Object.entries(filterConfig).map(([key, config]) => {
        const Icon = config.icon;
        const isActive = filters[key] !== 'All';
        return (
          <div key={key} className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <Icon className="w-4 h-4" /> {config.label}
            </label>
            <div className="relative">
              <select value={filters[key]} onChange={(e) => setFilters(prev => ({ ...prev, [key]: e.target.value }))}
                className={`w-full px-4 py-3 rounded-xl border appearance-none cursor-pointer transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-400/50 ${
                  isActive ? 'bg-orange-50 border-orange-200 text-orange-800' : 'bg-white border-gray-200 text-gray-700 hover:border-orange-200'
                }`}>
                {config.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              <ChevronLeft className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none rotate-[-90deg]" />
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-orange-50/20">
      <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-md border-b border-orange-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 ">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-200">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <div className=''>
                <Link to="/jobs">
                  <h1 className="text-xl  bg-amber-200 h-20 font-bold text-gray-800">
                    <img className='absolute -top-18 w-55' src={logo} alt="" />
                  </h1>
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/saved-jobs')}
                className="p-2.5 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors relative">
                <Bookmark className="w-5 h-5" />
                {savedJobs.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{savedJobs.length}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg shadow-orange-100/20 border border-orange-50 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by job title, company, or keywords..."
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all text-gray-800 placeholder-gray-400" />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowMobileFilters(true)}
                className="lg:hidden px-4 py-3.5 bg-orange-50 text-orange-600 rounded-xl font-medium hover:bg-orange-100 transition-colors flex items-center gap-2">
                <Filter className="w-4 h-4" /> Filters
                {hasFilters && <span className="w-2 h-2 bg-orange-500 rounded-full" />}
              </button>
              <div className="relative">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3.5 bg-gray-50 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400/50 appearance-none cursor-pointer pr-10">
                  <option value="latest">Latest First</option>
                  <option value="salary-high">Salary: High to Low</option>
                  <option value="salary-low">Salary: Low to High</option>
                </select>
                <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <AnimatePresence>
            {(activeFilters.length > 0 || searchQuery) && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
                {activeFilters.map(({ key, label, value }) => (
                  <FilterChip key={key} label={label} value={value} onRemove={() => setFilters(prev => ({ ...prev, [key]: 'All' }))} />
                ))}
                {searchQuery && <FilterChip label="Search" value={searchQuery} onRemove={() => setSearchQuery('')} />}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="flex gap-8">
          <div className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-28 bg-white rounded-2xl shadow-lg shadow-orange-100/20 border border-orange-50 p-5">
              <FilterContent />
            </div>
          </div>

          <AnimatePresence>
            {showMobileFilters && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 lg:hidden">
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)} />
                <motion.div variants={mobileDrawerVariants} initial="hidden" animate="visible" exit="exit"
                  className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-gray-800">Filters</h3>
                      <button onClick={() => setShowMobileFilters(false)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
                    </div>
                    <FilterContent />
                    <button onClick={() => setShowMobileFilters(false)}
                      className="w-full mt-6 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-200">
                      Show {sortedJobs.length} Results
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">
                Showing <span className="font-semibold text-gray-800">{paginatedJobs.length}</span> of{' '}
                <span className="font-semibold text-gray-800">{sortedJobs.length}</span> jobs
              </p>
              {loading && <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />}
            </div>

            {loading && paginatedJobs.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[...Array(6)].map((_, i) => <JobSkeleton key={i} />)}
              </div>
            ) : sortedJobs.length === 0 ? (
              <EmptyState hasFilters={hasFilters} onClear={clearAllFilters} />
            ) : (
              <motion.div variants={containerVariants} initial="hidden" animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {paginatedJobs.map((job, index) => (
                  <JobCard
                    key={job._id}
                    job={job}
                    index={index}
                    isSaved={savedJobs.includes(job._id)}
                    onToggleSave={toggleSaveJob}
                    onApplyClick={handleApplyFromCard}
                  />
                ))}
              </motion.div>
            )}

            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                  className="p-2.5 rounded-xl hover:bg-orange-50 disabled:opacity-40 transition-colors">
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i + 1} onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                      currentPage === i + 1 ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-200' : 'hover:bg-orange-50 text-gray-600'
                    }`}>{i + 1}</button>
                ))}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                  className="p-2.5 rounded-xl hover:bg-orange-50 disabled:opacity-40 transition-colors">
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ApplyModal
        isOpen={applyModal.isOpen}
        onClose={() => setApplyModal({ isOpen: false, job: null })}
        jobId={applyModal.job?._id}
        jobTitle={applyModal.job?.title}
        onSuccess={handleApplySuccess}
      />
    </div>
  );
};

export default Alljobs;