import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Building2,
  Users,
  Briefcase,
  UserPlus,
  UserCheck,
  MapPin,
  Mail,
  Phone,
  RefreshCw,
  BarChart3,
  ChevronRight,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Search
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend
} from 'recharts';

// ==========================
// AUTH HELPERS
// ==========================
const getToken = () => sessionStorage.getItem("companyToken");
const getCompanyUser = () => {
  try {
    return JSON.parse(sessionStorage.getItem("companyUser") || "{}");
  } catch {
    return {};
  }
};
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

// ==========================
// ANIMATION VARIANTS
// ==========================
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.08, delayChildren: 0.1 } 
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { 
    opacity: 1, y: 0, scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  }
};

// ==========================
// COLORS
// ==========================
const CHART_COLORS = {
  primary: ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5'],
  secondary: ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'],
  success: ['#22c55e', '#4ade80', '#86efac', '#bbf7d0', '#dcfce7'],
  danger: ['#ef4444', '#f87171', '#fca5a5', '#fecaca', '#fee2e2'],
  purple: ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'],
  teal: ['#14b8a6', '#2dd4bf', '#5eead4', '#99f6e4', '#ccfbf1']
};

const ALL_COLORS = [
  '#f97316', '#3b82f6', '#22c55e', '#8b5cf6', '#ef4444',
  '#14b8a6', '#f59e0b', '#ec4899', '#6366f1', '#84cc16'
];

// ==========================
// REUSABLE COMPONENTS
// ==========================

const StatCard = ({ title, value, subtitle, icon: Icon, color, trend, trendValue, onClick }) => (
  <motion.div
    variants={cardVariants}
    whileHover={{ y: -5, scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`group relative bg-white rounded-2xl shadow-lg shadow-orange-100/20 border border-orange-50 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-100/40 transition-all duration-300 overflow-hidden ${onClick ? 'cursor-pointer' : ''}`}
  >
    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} opacity-5 rounded-full -mr-10 -mt-10 group-hover:opacity-10 transition-opacity`} />
    <div className="relative p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
            trend === 'up' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {trendValue}
          </div>
        )}
      </div>
      <h3 className="text-3xl font-bold text-gray-800 mb-1">{value}</h3>
      <p className="text-sm font-semibold text-gray-600 mb-1">{title}</p>
      {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
    </div>
  </motion.div>
);

const ChartCard = ({ title, subtitle, children, className = "" }) => (
  <motion.div
    variants={cardVariants}
    className={`bg-white rounded-2xl shadow-lg shadow-orange-100/20 border border-orange-50 p-6 ${className}`}
  >
    <div className="mb-4">
      <h3 className="text-base font-bold text-gray-800">{title}</h3>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
    {children}
  </motion.div>
);

const StatusBadge = ({ status, label }) => {
  const styles = {
    active: 'bg-green-50 text-green-700 border-green-200',
    inactive: 'bg-red-50 text-red-700 border-red-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    open: 'bg-blue-50 text-blue-700 border-blue-200',
    closed: 'bg-gray-50 text-gray-700 border-gray-200',
    filled: 'bg-green-50 text-green-700 border-green-200'
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${styles[status] || styles.active}`}>
      {label || status}
    </span>
  );
};

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl p-6 border border-orange-50 animate-pulse">
    <div className="h-12 w-12 bg-gray-100 rounded-xl mb-4" />
    <div className="h-8 bg-gray-100 rounded-lg mb-2 w-20" />
    <div className="h-4 bg-gray-100 rounded-lg w-32" />
  </div>
);

const SkeletonChart = () => (
  <div className="bg-white rounded-2xl p-6 border border-orange-50 animate-pulse">
    <div className="h-6 bg-gray-100 rounded-lg mb-4 w-40" />
    <div className="h-64 bg-gray-50 rounded-xl" />
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-xl shadow-xl border border-orange-100 p-4">
        <p className="text-sm font-bold text-gray-800 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-gray-600">{entry.name}:</span>
            <span className="font-bold text-gray-800">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// ==========================
// MAIN COMPONENT
// ==========================
const MasterOverview = () => {
  const navigate = useNavigate();
  const companyUser = getCompanyUser();

  // Data states
  const [loading, setLoading] = useState(true);
  const [companyProfile, setCompanyProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [hrs, setHrs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [totalApplications, setTotalApplications] = useState(0); 
  const [refreshing, setRefreshing] = useState(false);

  // Filter states
  const [jobStatusFilter, setJobStatusFilter] = useState('all');
  const [jobSearchQuery, setJobSearchQuery] = useState('');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) {
        toast.error("Please login again", { position: "top-center" });
        navigate("/company", { replace: true });
        return;
      }

      const headers = { Authorization: `Bearer ${token}`, Accept: "application/json" };

      // 1. Fetch Company Profile
      const profilePromise = axios.get(`${BASE_URL}/company/profile`, { headers })
        .catch(err => { handleApiError(err, navigate); return { data: { data: null } }; });

      // 2. Fetch ALL Jobs from Public endpoint
      const jobsPromise = axios.get(`${BASE_URL}/jobs`, { headers })
        .catch(err => { handleApiError(err, navigate); return { data: { data: [] } }; });

      // 3. Fetch HRs
      const hrsPromise = axios.get(`${BASE_URL}/company/hr`, { headers })
        .catch(err => { handleApiError(err, navigate); return { data: { data: [] } }; });

      // 4. Fetch Employees
      const employeesPromise = axios.get(`${BASE_URL}/employees`, { headers })
        .catch(err => { 
            return { data: { data: [] } }; 
        });

      const [profileRes, jobsRes, hrsRes, employeesRes] = await Promise.all([
        profilePromise, jobsPromise, hrsPromise, employeesPromise
      ]);

      const profileData = profileRes.data?.data || null;
      setCompanyProfile(profileData);
      
      // TARGET COMPANY ID: Stronger check to find exactly where your ID is saved
      const targetCompanyId = profileData?._id || companyUser?._id || companyUser?.id || companyUser?.companyId;

      const allJobs = jobsRes.data?.data || [];
      
      // Filter Jobs using Strict String Comparison
      const myFetchedJobs = allJobs.filter(job => {
        const jobCompanyId = typeof job.company === 'object' ? job.company?._id : job.company;
        
        // Comparing as Strings to avoid Type Mismatch
        return String(jobCompanyId) === String(targetCompanyId);
      });

      setJobs(myFetchedJobs);
      setHrs(hrsRes.data?.data || []);
      setEmployees(employeesRes.data?.data || []);

      // Calculate Total Applications
      const totalApps = myFetchedJobs.reduce((sum, job) => {
        return sum + (job.applicationCount || job.applicationsCount || 0);
      }, 0);
      
      setTotalApplications(totalApps);

    } catch (error) {
      toast.error("Failed to load dashboard data", { position: "top-center" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAllData();
  };

  // ==========================
  // COMPUTED STATS
  // ==========================
  const stats = useMemo(() => {
    const totalJobs = jobs.length;
    const activeJobs = jobs.filter(j => j.status === 'active' || j.isActive !== false).length;
    const closedJobs = totalJobs - activeJobs;
    const totalHRs = hrs.length;
    const activeHRs = hrs.filter(h => h.isActive).length;
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(e => e.isActive !== false).length;

    // Jobs by category
    const jobsByCategory = jobs.reduce((acc, job) => {
      const cat = job.department || job.category || job.jobType || 'Other';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    // Jobs by location
    const jobsByLocation = jobs.reduce((acc, job) => {
      const loc = job.location || job.city || 'Remote';
      acc[loc] = (acc[loc] || 0) + 1;
      return acc;
    }, {});

    // Jobs posted over time (last 6 months)
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        name: d.toLocaleString('default', { month: 'short' }),
        fullDate: d,
        jobs: 0
      });
    }

    jobs.forEach(job => {
      const jobDate = new Date(job.createdAt || job.postedDate || job.date);
      months.forEach(m => {
        if (jobDate.getMonth() === m.fullDate.getMonth() && 
            jobDate.getFullYear() === m.fullDate.getFullYear()) {
          m.jobs += 1;
        }
      });
    });

    // HR categories
    const hrsByCategory = hrs.reduce((acc, hr) => {
      const cat = hr.category || 'Unassigned';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    const hrStatusData = [
      { name: 'Active', value: activeHRs, color: '#22c55e' },
      { name: 'Inactive', value: totalHRs - activeHRs, color: '#ef4444' }
    ];

    const jobStatusData = [
      { name: 'Active', value: activeJobs, color: '#3b82f6' },
      { name: 'Closed', value: closedJobs, color: '#9ca3af' }
    ];

    const topLocations = Object.entries(jobsByLocation)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }));

    const categoryPieData = Object.entries(jobsByCategory)
      .map(([name, value]) => ({ name, value }));

    return {
      totalJobs, activeJobs, closedJobs,
      totalHRs, activeHRs,
      totalEmployees, activeEmployees,
      jobsByCategory, jobsByLocation,
      monthlyTrend: months,
      hrsByCategory,
      hrStatusData,
      jobStatusData,
      topLocations,
      categoryPieData
    };
  }, [jobs, hrs, employees]);

  // Filtered jobs for table
  const filteredJobs = useMemo(() => {
    let filtered = [...jobs];
    if (jobStatusFilter !== 'all') {
      filtered = filtered.filter(j => {
        if (jobStatusFilter === 'active') return j.status === 'active' || j.isActive !== false;
        if (jobStatusFilter === 'closed') return j.status === 'closed' || j.isActive === false;
        return true;
      });
    }
    if (jobSearchQuery.trim()) {
      const q = jobSearchQuery.toLowerCase();
      filtered = filtered.filter(j => 
        j.title?.toLowerCase().includes(q) ||
        j.location?.toLowerCase().includes(q) ||
        j.department?.toLowerCase().includes(q)
      );
    }
    return filtered.slice(0, 10); // Show top 10 recent
  }, [jobs, jobStatusFilter, jobSearchQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/40 via-white to-orange-50/30 font-sans antialiased">
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
                onClick={() => navigate('/company-dashboard')}
                className="p-2.5 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Master Overview</h1>
                <p className="text-sm text-gray-500">
                  {companyProfile?.companyName || 'Company'} Dashboard
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2.5 bg-orange-50 text-orange-600 rounded-xl font-semibold hover:bg-orange-100 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Company Info Banner */}
        {companyProfile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl p-6 mb-8 text-white relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-16 -mb-16" />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{companyProfile.companyName}</h2>
                  <div className="flex items-center gap-4 mt-1 text-orange-100 text-sm">
                    {companyProfile.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" /> {companyProfile.email}
                      </span>
                    )}
                    {companyProfile.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" /> {companyProfile.phone}
                      </span>
                    )}
                    {companyProfile.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {companyProfile.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-center">
                  <p className="text-2xl font-bold">{stats.totalJobs}</p>
                  <p className="text-xs text-orange-100">Total Jobs</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-center">
                  <p className="text-2xl font-bold">{stats.totalHRs}</p>
                  <p className="text-xs text-orange-100">HR Team</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            <>
              <StatCard
                title="Total Jobs"
                value={stats.totalJobs}
                subtitle={`${stats.activeJobs} active, ${stats.closedJobs} closed`}
                icon={Briefcase}
                color="from-orange-500 to-orange-600"
                onClick={() => navigate('/company/jobs')}
              />
              <StatCard
                title="HR Managers"
                value={stats.totalHRs}
                subtitle={`${stats.activeHRs} active`}
                icon={Users}
                color="from-blue-500 to-blue-600"
                onClick={() => navigate('/company/hrdirectory')}
              />
              <StatCard
                title="Total Employees"
                value={stats.totalEmployees || 0}
                subtitle={`${stats.activeEmployees || 0} active`}
                icon={UserCheck}
                color="from-green-500 to-green-600"
              />
              <StatCard
                title="Applications"
                value={totalApplications}
                subtitle="Total received across jobs"
                icon={FileText}
                color="from-purple-500 to-purple-600"
              />
            </>
          )}
        </motion.div>

        {/* Charts Row 1: Job Trends & Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {loading ? (
            <>
              <SkeletonChart className="lg:col-span-2" />
              <SkeletonChart />
            </>
          ) : (
            <>
              <ChartCard title="Job Posting Trends" subtitle="Last 6 months" className="lg:col-span-2">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={stats.monthlyTrend}>
                    <defs>
                      <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="jobs" 
                      name="Jobs Posted" 
                      stroke="#f97316" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorJobs)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Job Status Distribution" subtitle="Active vs Closed">
                <ResponsiveContainer width="100%" height={300}>
                  <RePieChart>
                    <Pie
                      data={stats.jobStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {stats.jobStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="bottom" height={36} />
                  </RePieChart>
                </ResponsiveContainer>
              </ChartCard>
            </>
          )}
        </div>

        {/* Charts Row 2: Categories & Locations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {loading ? (
            <>
              <SkeletonChart />
              <SkeletonChart />
            </>
          ) : (
            <>
              <ChartCard title="Jobs by Category" subtitle="Distribution across departments">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.categoryPieData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: '#6b7280' }} width={100} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" name="Jobs" radius={[0, 8, 8, 0]}>
                      {stats.categoryPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={ALL_COLORS[index % ALL_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Top Locations" subtitle="Job distribution by city">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.topLocations}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" name="Jobs" radius={[8, 8, 0, 0]}>
                      {stats.topLocations.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS.teal[index % CHART_COLORS.teal.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </>
          )}
        </div>

        {/* HR Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {loading ? (
            <>
              <SkeletonChart className="lg:col-span-2" />
              <SkeletonChart />
            </>
          ) : (
            <>
              <ChartCard title="HR Team by Category" subtitle="Department distribution" className="lg:col-span-2">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={Object.entries(stats.hrsByCategory).map(([name, value]) => ({ name, value }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" name="HR Count" radius={[8, 8, 0, 0]}>
                      {Object.entries(stats.hrsByCategory).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS.purple[index % CHART_COLORS.purple.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="HR Status" subtitle="Active vs Inactive">
                <ResponsiveContainer width="100%" height={280}>
                  <RePieChart>
                    <Pie
                      data={stats.hrStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {stats.hrStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="bottom" height={36} />
                  </RePieChart>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="bg-green-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-green-700">{stats.activeHRs}</p>
                    <p className="text-xs text-green-600 font-medium">Active</p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-red-700">{stats.totalHRs - stats.activeHRs}</p>
                    <p className="text-xs text-red-600 font-medium">Inactive</p>
                  </div>
                </div>
              </ChartCard>
            </>
          )}
        </div>

        {/* Recent Jobs Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl shadow-xl shadow-orange-100/30 border border-orange-50 overflow-hidden mb-8"
        >
          <div className="p-6 border-b border-orange-50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-1 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full" />
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Recent Job Postings</h2>
                  <p className="text-sm text-gray-400">Latest jobs posted by your HR team</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={jobSearchQuery}
                    onChange={(e) => setJobSearchQuery(e.target.value)}
                    placeholder="Search jobs..."
                    className="pl-9 pr-4 py-2 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 w-48"
                  />
                </div>
                <select
                  value={jobStatusFilter}
                  onChange={(e) => setJobStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/50"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-14 bg-gray-50 rounded-xl" />
                ))}
              </div>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4">
                <Briefcase className="w-8 h-8 text-orange-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">No jobs found</h3>
              <p className="text-sm text-gray-400">No job postings match your filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-orange-50/50 border-b border-orange-100">
                    <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Job Title</th>
                    <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Posted</th>
                    <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJobs.map((job, index) => (
                    <motion.tr
                      key={job._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-gray-50 hover:bg-orange-50/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                            <Briefcase className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-sm">{job.title}</p>
                            <p className="text-xs text-gray-400">{job.employmentType || 'Full-time'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          {job.location || 'Remote'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border bg-blue-50 text-blue-700 border-blue-200">
                          {job.department || job.category || 'General'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(job.createdAt || job.postedDate).toLocaleDateString('en-US', { 
                          month: 'short', day: 'numeric', year: 'numeric' 
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge 
                          status={job.status === 'active' || job.isActive !== false ? 'active' : 'closed'}
                          label={job.status === 'active' || job.isActive !== false ? 'Active' : 'Closed'}
                        />
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="px-6 py-4 border-t border-orange-50 flex justify-center">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/company/jobs')}
              className="flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors"
            >
              View All Jobs
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl p-8 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-16 -mb-16" />

          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-2">Quick Actions</h3>
            <p className="text-orange-100 mb-6">Manage your company operations efficiently</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Create HR', path: '/creteHr', icon: UserPlus },
                { label: 'HR Directory', path: '/company/hrdirectory', icon: Users },
                { label: 'Post Job', path: '/company/post-job', icon: Briefcase },
                { label: 'Analytics', path: '/analytics', icon: BarChart3 },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <motion.button
                    key={action.path}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(action.path)}
                    className="flex items-center gap-2 px-4 py-3 bg-white/20 backdrop-blur-sm rounded-xl font-semibold hover:bg-white/30 transition-colors text-sm"
                  >
                    <Icon className="w-4 h-4" />
                    {action.label}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default MasterOverview;