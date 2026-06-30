import React, { useState, useEffect, useCallback } from 'react';
import { CalendarDays, FileText, Send, Leaf, Clock3 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import Cookies from 'js-cookie';

const BASE_URL = window.API_BASE_URL;

const formatDate = (dateValue) => {
  if (!dateValue) return '—';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const getStatusStyles = (status = '') => {
  const normalized = status.toLowerCase();

  if (normalized === 'approved') {
    return 'bg-green-100 text-green-700 border-green-200';
  }
  if (normalized === 'rejected') {
    return 'bg-red-100 text-red-700 border-red-200';
  }
  return 'bg-amber-100 text-amber-700 border-amber-200';
};

function LeaveApplyEm() {
  const companyUser = JSON.parse(sessionStorage.getItem('companyUser') || 'null');
  const userId = companyUser?._id || companyUser?.id || null;
  const employeeName = companyUser?.name || companyUser?.fullName || 'Employee';

  const getAuthToken = () => {
    return Cookies.get('jobdekho_token') || sessionStorage.getItem('employeeToken') || sessionStorage.getItem('companyToken') || sessionStorage.getItem('accessToken') || null;
  };

  const [formData, setFormData] = useState({
    date: '',
    reason: '',
  });

  const [myLeaves, setMyLeaves] = useState([]);
  const [loading, setLoading] = useState({
    fetch: true,
    submit: false,
  });

  const fetchMyLeaves = useCallback(async () => {
    if (!userId) {
      setLoading((prev) => ({ ...prev, fetch: false }));
      return;
    }

    setLoading((prev) => ({ ...prev, fetch: true }));

    try {
      const token = getAuthToken();
      const response = await axios.get(`${BASE_URL}/attendance/leaves`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const allLeaves = response?.data?.data || response?.data || [];

      // Filter leaves specifically for the logged-in employee
      const filteredLeaves = Array.isArray(allLeaves)
        ? allLeaves.filter((leave) => {
            const leaveUserId =
              leave?.employeeId?._id ||
              leave?.employeeId?.id ||
              leave?.employeeId ||
              leave?.userId?._id ||
              leave?.userId?.id ||
              leave?.userId;

            return String(leaveUserId) === String(userId);
          })
        : [];

      // Sort latest first
      filteredLeaves.sort((a, b) => {
        const aDate = new Date(a?.createdAt || a?.date || 0).getTime();
        const bDate = new Date(b?.createdAt || b?.date || 0).getTime();
        return bDate - aDate;
      });

      setMyLeaves(filteredLeaves);
    } catch (error) {
      console.error('Failed to fetch employee leaves:', error);
      const msg = error?.response?.data?.message || error?.message || 'Failed to load leave history';
      toast.error(msg);
      setMyLeaves([]);
    } finally {
      setLoading((prev) => ({ ...prev, fetch: false }));
    }
  }, [userId]);

  useEffect(() => {
    fetchMyLeaves();
  }, [fetchMyLeaves]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      toast.error('Employee session not found. Please login again.');
      return;
    }

    if (!formData.date.trim()) {
      toast.error('Please select a leave date');
      return;
    }

    if (!formData.reason.trim()) {
      toast.error('Please enter a reason for leave');
      return;
    }

    setLoading((prev) => ({ ...prev, submit: true }));

    try {
      const payload = {
        date: formData.date,
        reason: formData.reason.trim(),
      };

      const token = getAuthToken();
      const response = await axios.post(`${BASE_URL}/attendance/leave`, payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      const createdLeave = response?.data?.data || response?.data || {
        _id: Date.now().toString(),
        date: formData.date,
        reason: formData.reason.trim(),
        status: 'Pending',
        employeeId: {
          _id: userId,
          name: employeeName,
          email: companyUser?.email || '',
        },
        createdAt: new Date().toISOString(),
      };

      toast.success(response?.data?.message || response?.message || 'Leave request submitted successfully');

      // Update local state in real-time
      setMyLeaves((prev) => [createdLeave, ...prev]);
      setFormData({
        date: '',
        reason: '',
      });
    } catch (error) {
      console.error('Apply leave error:', error);
      const msg = error?.response?.data?.message || error?.message || 'Failed to submit leave request';
      toast.error(msg);
    } finally {
      setLoading((prev) => ({ ...prev, submit: false }));
    }
  };

  const totalLeaves = myLeaves.length;
  const pendingLeaves = myLeaves.filter(
    (leave) => (leave?.status || '').toLowerCase() === 'pending'
  ).length;
  const approvedLeaves = myLeaves.filter(
    (leave) => (leave?.status || '').toLowerCase() === 'approved'
  ).length;
  const rejectedLeaves = myLeaves.filter(
    (leave) => (leave?.status || '').toLowerCase() === 'rejected'
  ).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#1f2937',
            color: '#fff',
            borderRadius: '12px',
          },
        }}
      />

      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl bg-orange-100 flex items-center justify-center shadow-sm">
                <Leaf className="w-5 h-5 text-orange-600" />
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  Leave Application
                </h1>
                <p className="text-sm sm:text-base text-slate-500 mt-1">
                  Apply for leave and track the status of your requests.
                </p>
              </div>
            </div>

            <div className="text-sm text-slate-500">
              Logged in as{' '}
              <span className="font-semibold text-slate-700">{employeeName}</span>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Requests</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{totalLeaves}</h3>
              </div>
              <div className="w-11 h-11 rounded-xl bg-orange-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Pending</p>
                <h3 className="text-2xl font-bold text-amber-600 mt-1">{pendingLeaves}</h3>
              </div>
              <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center">
                <Clock3 className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Approved</p>
                <h3 className="text-2xl font-bold text-green-600 mt-1">{approvedLeaves}</h3>
              </div>
              <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center">
                <CalendarDays className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Rejected</p>
                <h3 className="text-2xl font-bold text-red-600 mt-1">{rejectedLeaves}</h3>
              </div>
              <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* Leave form */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">Apply for Leave</h2>
                <p className="text-sm text-slate-500 mt-1">Submit a leave request for approval.</p>
              </div>

              <form onSubmit={handleLeaveSubmit} className="p-6 space-y-5">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-slate-700 mb-2">
                    Leave Date
                  </label>
                  <div className="relative">
                    <input
                      id="date"
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-800 outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-400 transition"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-slate-700 mb-2">
                    Reason
                  </label>
                  <textarea
                    id="reason"
                    name="reason"
                    rows={5}
                    placeholder="Write the reason for your leave request..."
                    value={formData.reason}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-800 outline-none resize-none focus:ring-4 focus:ring-orange-100 focus:border-orange-400 transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading.submit}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 hover:bg-orange-600 disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold px-5 py-3 transition shadow-sm"
                >
                  {loading.submit ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Leave Request
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Leave history */}
          <div className="xl:col-span-3">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">My Leave History</h2>
                  <p className="text-sm text-slate-500 mt-1">Review your previous leave requests and their status.</p>
                </div>

                <button
                  onClick={fetchMyLeaves}
                  className="shrink-0 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  Refresh
                </button>
              </div>

              <div className="p-6">
                {loading.fetch ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="animate-pulse rounded-2xl border border-slate-200 p-4">
                        <div className="h-4 w-32 bg-slate-200 rounded mb-3" />
                        <div className="h-3 w-full bg-slate-100 rounded mb-2" />
                        <div className="h-3 w-2/3 bg-slate-100 rounded" />
                      </div>
                    ))}
                  </div>
                ) : myLeaves.length === 0 ? (
                  <div className="text-center py-14">
                    <div className="mx-auto w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mb-4">
                      <Leaf className="w-7 h-7 text-orange-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">No leave requests yet</h3>
                    <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                      You haven’t submitted any leave request. Fill the form to create your first leave request.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myLeaves.map((leave) => (
                      <div
                        key={leave?._id || `${leave?.date}-${leave?.createdAt}`}
                        className="rounded-2xl border border-slate-200 p-4 hover:shadow-sm transition"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="space-y-2 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-base font-semibold text-slate-900">
                                Leave for {formatDate(leave?.date)}
                              </h3>
                              <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyles(leave?.status)}`}>
                                {leave?.status || 'Pending'}
                              </span>
                            </div>

                            <p className="text-sm text-slate-600 leading-6">
                              {leave?.reason || 'No reason provided'}
                            </p>

                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500 pt-1">
                              <span>
                                <strong className="text-slate-700">Applied:</strong>{' '}
                                {formatDate(leave?.createdAt)}
                              </span>

                              {leave?.updatedAt && (
                                <span>
                                  <strong className="text-slate-700">Updated:</strong>{' '}
                                  {formatDate(leave?.updatedAt)}
                                </span>
                              )}
                            </div>

                            {leave?.hrComment && (
                              <div className="mt-3 rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3">
                                <p className="text-xs font-semibold text-slate-700 mb-1">HR Comment</p>
                                <p className="text-sm text-slate-600">{leave.hrComment}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default LeaveApplyEm;