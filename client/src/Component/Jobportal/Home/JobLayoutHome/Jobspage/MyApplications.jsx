import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../Context/AppContext';
import { useUserProfile } from '../../../../Context/UserProfileContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import {
  ArrowLeft, Search, Filter, MapPin, Briefcase, DollarSign, Clock,
  CheckCircle2, XCircle, Loader2, AlertCircle, FileText, Mail, Calendar,
  ChevronDown, Building2, Award, Hourglass, BrainCircuit, ListChecks,
  PauseCircle, Eye, UserCheck, CalendarCheck, ClipboardCheck, Send, Handshake, Ban
} from 'lucide-react';

const BASE_URL = window.API_BASE_URL;
const getUserToken = () => Cookies.get("jobdekho_token") || null;

// ==================== Status Badge ====================
const StatusBadge = ({ status }) => {
  const normalized = (status || 'APPLIED').toLowerCase().replace(/ /g, '_');

  const STATUS_MAP = {
    applied: { style: 'bg-gray-50 text-gray-700 border-gray-200', icon: <Hourglass className="w-3.5 h-3.5" />, label: 'Applied' },
    ai_screened: { style: 'bg-purple-50 text-purple-700 border-purple-200', icon: <BrainCircuit className="w-3.5 h-3.5" />, label: 'AI Screened' },
    shortlist_queue: { style: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: <ListChecks className="w-3.5 h-3.5" />, label: 'Shortlist Queue' },
    hold_queue: { style: 'bg-amber-50 text-amber-700 border-amber-200', icon: <PauseCircle className="w-3.5 h-3.5" />, label: 'On Hold' },
    under_hr_review: { style: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: <Clock className="w-3.5 h-3.5" />, label: 'Under HR Review' },
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
      {config.icon}{config.label}
    </span>
  );
};

const SkeletonCard = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
    <div className="flex items-start gap-4">
      <div className="w-14 h-14 rounded-lg bg-gray-200" />
      <div className="flex-1 space-y-2">
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="flex gap-2"><div className="h-6 bg-gray-200 rounded-full w-20" /><div className="h-6 bg-gray-200 rounded-full w-24" /></div>
      </div>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
      {[1,2,3,4].map(i => <div key={i} className="space-y-2"><div className="h-3 bg-gray-200 rounded w-16" /><div className="h-4 bg-gray-200 rounded w-full" /></div>)}
    </div>
  </div>
);

const EmptyState = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-32 h-32 bg-orange-50 rounded-full flex items-center justify-center mb-6">
        <Briefcase className="w-16 h-16 text-orange-300" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">No applications yet</h3>
      <p className="text-gray-500 max-w-md mb-8">Start exploring opportunities and apply to jobs that match your skills.</p>
      <button onClick={() => navigate('/jobportal/alljobs')} className="px-6 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors shadow-sm">Browse Jobs</button>
    </div>
  );
};

const WithdrawModal = ({ isOpen, onClose, onConfirm, jobTitle, isLoading }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center"><AlertCircle className="w-5 h-5 text-red-600" /></div>
          <h3 className="text-lg font-semibold text-gray-900">Withdraw Application</h3>
        </div>
        <p className="text-gray-600 mb-6">Are you sure you want to withdraw your application for <span className="font-semibold">"{jobTitle}"</span>?</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} disabled={isLoading} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
          <button onClick={onConfirm} disabled={isLoading} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50">{isLoading ? 'Withdrawing...' : 'Withdraw'}</button>
        </div>
      </div>
    </div>
  );
};

// ==================== Main Component ====================
const MyApplications = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { 
    myApplications: contextApplications, 
    myApplicationsLoading: contextLoading,
    applicationsFetched: contextApplicationsFetched,
    fetchMyApplications: contextFetch,
    unmarkJobAsApplied,
  } = useUserProfile();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [withdrawModal, setWithdrawModal] = useState({ isOpen: false, application: null, isLoading: false });

  const applications = contextApplications;
  const loading = contextLoading || !contextApplicationsFetched;

  useEffect(() => {
    if (isAuthenticated && contextFetch) {
      contextFetch(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const stats = useMemo(() => {
    const total = applications.length;
    const pending = applications.filter(a => {
      const s = (a.internalStatus || a.candidateStatus || a.status || 'APPLIED').toLowerCase();
      return ['applied', 'ai_screened', 'shortlist_queue', 'hold_queue'].includes(s);
    }).length;
    const inReview = applications.filter(a => {
      const s = (a.internalStatus || a.candidateStatus || a.status || '').toLowerCase();
      return s === 'under_hr_review';
    }).length;
    const shortlisted = applications.filter(a => {
      const s = (a.internalStatus || a.candidateStatus || a.status || '').toLowerCase();
      return ['shortlisted', 'interview_scheduled', 'interview_completed'].includes(s);
    }).length;
    const accepted = applications.filter(a => {
      const s = (a.internalStatus || a.candidateStatus || a.status || '').toLowerCase();
      return ['selected', 'offer_sent', 'offer_accepted', 'hired'].includes(s);
    }).length;
    const rejected = applications.filter(a => {
      const s = (a.internalStatus || a.candidateStatus || a.status || '').toLowerCase();
      return s === 'not_selected';
    }).length;
    return { total, pending, inReview, shortlisted, rejected, accepted };
  }, [applications]);

  const filteredApplications = useMemo(() => {
    let result = [...applications];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(app => {
        const title = (app.job?.title || '').toLowerCase();
        const company = (app.job?.company?.name || '').toLowerCase();
        return title.includes(query) || company.includes(query);
      });
    }
    if (statusFilter !== 'all') {
      result = result.filter(app => {
        const s = (app.internalStatus || app.candidateStatus || app.status || 'APPLIED').toLowerCase();
        if (statusFilter === 'pending') return ['applied', 'ai_screened', 'shortlist_queue', 'hold_queue'].includes(s);
        if (statusFilter === 'in_review') return s === 'under_hr_review';
        if (statusFilter === 'interviewing') return ['shortlisted', 'interview_scheduled', 'interview_completed'].includes(s);
        if (statusFilter === 'accepted') return ['selected', 'offer_sent', 'offer_accepted', 'hired'].includes(s);
        if (statusFilter === 'rejected') return s === 'not_selected';
        return s === statusFilter;
      });
    }
    switch (sortBy) {
      case 'latest': result.sort((a, b) => new Date(b.appliedAt || b.createdAt || 0) - new Date(a.appliedAt || a.createdAt || 0)); break;
      case 'oldest': result.sort((a, b) => new Date(a.appliedAt || a.createdAt || 0) - new Date(b.appliedAt || b.createdAt || 0)); break;
      default: break;
    }
    return result;
  }, [applications, searchQuery, statusFilter, sortBy]);

  const handleWithdraw = useCallback((application) => {
    setWithdrawModal({ isOpen: true, application, isLoading: false });
  }, []);

  const confirmWithdraw = useCallback(async () => {
    const app = withdrawModal.application;
    if (!app) return;
    setWithdrawModal(prev => ({ ...prev, isLoading: true }));
    const token = getUserToken();
    try {
      const appId = app._id || app.id;
      await axios.delete(`${BASE_URL}/applications/${appId}/withdraw`, { headers: { Authorization: `Bearer ${token}` } });
      if (contextFetch) contextFetch(true);
      toast.success('Application withdrawn successfully');
      setWithdrawModal({ isOpen: false, application: null, isLoading: false });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to withdraw application');
      setWithdrawModal(prev => ({ ...prev, isLoading: false }));
    }
  }, [withdrawModal.application, contextFetch]);

  if (!isAuthenticated && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4"><AlertCircle className="w-8 h-8 text-orange-500" /></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Please Log In</h2>
          <p className="text-gray-500 mb-6">You need to be logged in to view your applications.</p>
          <button onClick={() => navigate('/login')} className="w-full px-4 py-2.5 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors">Log In</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Applications</h1>
              <p className="mt-1 text-sm text-gray-500">Track and manage your job applications</p>
            </div>
            <button onClick={() => navigate('/jobportal/alljobs')} className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-50 text-orange-700 font-medium rounded-lg hover:bg-orange-100 transition-colors border border-orange-200 text-sm">
              <ArrowLeft className="w-4 h-4" />Browse Jobs
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Total', value: stats.total, color: 'orange', icon: Briefcase },
            { label: 'Pending', value: stats.pending, color: 'gray', icon: Hourglass },
            { label: 'In Review', value: stats.inReview, color: 'yellow', icon: Clock },
            { label: 'Interviewing', value: stats.shortlisted, color: 'blue', icon: CalendarCheck },
            { label: 'Selected', value: stats.accepted, color: 'emerald', icon: Award },
            { label: 'Not Selected', value: stats.rejected, color: 'red', icon: Ban }
          ].map((stat) => {
            const Icon = stat.icon;
            const colorMap = { orange: 'bg-orange-50 border-orange-200 text-orange-700', gray: 'bg-gray-50 border-gray-200 text-gray-700', yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700', blue: 'bg-blue-50 border-blue-200 text-blue-700', emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700', red: 'bg-red-50 border-red-200 text-red-700' };
            const iconColorMap = { orange: 'text-orange-500', gray: 'text-gray-500', yellow: 'text-yellow-500', blue: 'text-blue-500', emerald: 'text-emerald-500', red: 'text-red-500' };
            return (
              <div key={stat.label} className={`${colorMap[stat.color]} border rounded-xl p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`w-5 h-5 ${iconColorMap[stat.color]}`} />
                  <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                </div>
                <p className={`text-sm font-medium ${colorMap[stat.color].split(' ')[2]}`}>{stat.label}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by job title or company..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm" />
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 sm:flex-none">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full appearance-none px-4 py-2.5 pr-10 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-orange-500 text-sm">
                  <option value="all">All Stages</option>
                  <option value="pending">Applied / Queue</option>
                  <option value="in_review">Under HR Review</option>
                  <option value="interviewing">Shortlisted / Interviewing</option>
                  <option value="accepted">Selected / Hired</option>
                  <option value="rejected">Not Selected</option>
                  <option disabled>──────────</option>
                  <option value="applied">Applied</option>
                  <option value="ai_screened">AI Screened</option>
                  <option value="shortlist_queue">Shortlist Queue</option>
                  <option value="hold_queue">Hold Queue</option>
                  <option value="under_hr_review">Under HR Review</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="interview_scheduled">Interview Scheduled</option>
                  <option value="interview_completed">Interview Completed</option>
                  <option value="selected">Selected</option>
                  <option value="offer_sent">Offer Sent</option>
                  <option value="offer_accepted">Offer Accepted</option>
                  <option value="hired">Hired</option>
                  <option value="not_selected">Not Selected</option>
                </select>
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              <div className="relative flex-1 sm:flex-none">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full appearance-none px-4 py-2.5 pr-10 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-orange-500 text-sm">
                  <option value="latest">Latest Applied</option>
                  <option value="oldest">Oldest First</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {loading ? (
            [1, 2, 3].map(i => <SkeletonCard key={i} />)
          ) : filteredApplications.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100"><EmptyState /></div>
          ) : (
            filteredApplications.map((app) => (
              <ApplicationCard key={app._id || app.id} application={app} onWithdraw={handleWithdraw} onViewDetails={(jobId) => navigate(`/jobportal/alljobs/${jobId}`)} />
            ))
          )}
        </div>
      </div>

      <WithdrawModal isOpen={withdrawModal.isOpen} onClose={() => setWithdrawModal({ isOpen: false, application: null, isLoading: false })} onConfirm={confirmWithdraw} jobTitle={withdrawModal.application?.job?.title || 'this position'} isLoading={withdrawModal.isLoading} />
    </div>
  );
};

// ==================== Application Card ====================
const ApplicationCard = ({ application, onWithdraw, onViewDetails }) => {
  const jobId = application.job?._id;
  const jobTitle = application.job?.title || 'Untitled Job';
  const companyName = application.job?.company?.name || 'Unknown Company';
  const companyLogo = application.job?.company?.logo;
  const location = application.job?.location || 'Not specified';
  const jobType = application.job?.employmentType || 'Not specified';
  const salaryRange = application.job?.salary || application.job?.salaryRange;
  const experienceRequired = application.job?.experienceLevel || 'Not specified';
  const skillsRequired = application.job?.skills || [];
  const applicationDate = application.appliedAt || application.createdAt;
  
  // ==================== FIX: Try all possible status field names ====================
  const rawStatus = 
    application.internalStatus || 
    application.candidateStatus || 
    application.status ||
    application.applicationStatus ||
    application.state ||
    application.jobStatus ||
    (application.meta && application.meta.status) ||
    'APPLIED';

  // Normalize status (handle both snake_case and UPPER_CASE from server)
  const status = rawStatus.toUpperCase();
  
  const resumeSubmitted = !!application.resume;
  const coverLetterSubmitted = !!application.coverLetter;
  const jobDescription = application.job?.description || '';

  // Withdraw only for initial statuses
  const canWithdraw = ['APPLIED', 'AI_SCREENED', 'SHORTLIST_QUEUE', 'HOLD_QUEUE'].includes(status);

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatSalary = (salary) => {
    if (!salary) return 'Not disclosed';
    if (typeof salary === 'string') return salary;
    if (salary.min && salary.max) return `₹${salary.min.toLocaleString()} - ₹${salary.max.toLocaleString()}`;
    return 'Not disclosed';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 overflow-hidden">
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            {companyLogo ? (
              <img src={companyLogo} alt={companyName} className="w-14 h-14 rounded-lg object-cover border border-gray-100" onError={(e) => { e.target.style.display = 'none'; }} />
            ) : (
              <div className="w-14 h-14 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center">
                <span className="text-orange-600 font-bold text-xl">{companyName.charAt(0).toUpperCase()}</span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate hover:text-orange-600 transition-colors cursor-pointer" onClick={() => onViewDetails(jobId)}>{jobTitle}</h3>
            <p className="text-sm text-gray-600 font-medium">{companyName}</p>
            <div className="flex items-center gap-3 mt-2">
              <StatusBadge status={status} />
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-500 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Applied {formatDate(applicationDate)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div className="flex items-start gap-2"><MapPin className="w-4 h-4 text-gray-400 mt-0.5" /><div><p className="text-xs text-gray-400">Location</p><p className="text-sm font-medium text-gray-700 truncate">{location}</p></div></div>
          <div className="flex items-start gap-2"><Briefcase className="w-4 h-4 text-gray-400 mt-0.5" /><div><p className="text-xs text-gray-400">Job Type</p><p className="text-sm font-medium text-gray-700 truncate">{jobType}</p></div></div>
          <div className="flex items-start gap-2"><DollarSign className="w-4 h-4 text-gray-400 mt-0.5" /><div><p className="text-xs text-gray-400">Salary</p><p className="text-sm font-medium text-gray-700 truncate">{formatSalary(salaryRange)}</p></div></div>
          <div className="flex items-start gap-2"><Award className="w-4 h-4 text-gray-400 mt-0.5" /><div><p className="text-xs text-gray-400">Experience</p><p className="text-sm font-medium text-gray-700 truncate">{experienceRequired}</p></div></div>
        </div>

        {skillsRequired.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {skillsRequired.slice(0, 5).map((skill, i) => <span key={i} className="px-2.5 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-md border border-gray-100">{skill}</span>)}
            {skillsRequired.length > 5 && <span className="px-2.5 py-1 bg-orange-50 text-orange-600 text-xs font-medium rounded-md border border-orange-100">+{skillsRequired.length - 5}</span>}
          </div>
        )}

        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-50">
          <span className={`text-xs flex items-center gap-1 ${resumeSubmitted ? 'text-green-600' : 'text-gray-400'}`}><FileText className="w-4 h-4" />Resume {resumeSubmitted ? 'Submitted' : 'Not Submitted'}</span>
          <span className={`text-xs flex items-center gap-1 ${coverLetterSubmitted ? 'text-green-600' : 'text-gray-400'}`}><Mail className="w-4 h-4" />Cover Letter {coverLetterSubmitted ? 'Submitted' : 'Not Submitted'}</span>
        </div>

        {jobDescription && <p className="mt-4 text-sm text-gray-600 leading-relaxed line-clamp-2">{jobDescription}</p>}

        <div className="flex items-center gap-3 mt-5 pt-4 border-t border-gray-100">
          <button onClick={() => onViewDetails(jobId)} className="flex-1 sm:flex-none px-4 py-2 bg-orange-50 text-orange-700 font-medium rounded-lg hover:bg-orange-100 transition-colors text-sm flex items-center justify-center gap-2"><Building2 className="w-4 h-4" />View Details</button>
          {canWithdraw && <button onClick={() => onWithdraw(application)} className="flex-1 sm:flex-none px-4 py-2 bg-white text-red-600 border border-red-200 font-medium rounded-lg hover:bg-red-50 transition-colors text-sm flex items-center justify-center gap-2"><XCircle className="w-4 h-4" />Withdraw</button>}
        </div>
      </div>
    </div>
  );
};

export default MyApplications;