import React, { useState } from 'react';
import { Search, Filter, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import LeaveBadge from '../Employeedashboard/LeaveBadge';

const Skeleton = () => (
  <div className="animate-pulse bg-slate-100 rounded-xl h-20 w-full" />
);

const getEmployeeInfo = (leave) => {
  if (leave?.employeeId && typeof leave.employeeId === 'object' && leave.employeeId.name) {
    return {
      name: leave.employeeId.name,
      email: leave.employeeId.email || '',
      id: leave.employeeId._id || leave.employeeId.id || '',
      avatar: (leave.employeeId.name[0] || '?').toUpperCase(),
    };
  }
  if (leave?.employee && typeof leave.employee === 'object') {
    return {
      name: leave.employee.name || 'Unknown',
      email: leave.employee.email || '',
      id: leave.employee._id || leave.employee.id || '',
      avatar: (leave.employee.name?.[0] || '?').toUpperCase(),
    };
  }
  if (leave?.employeeName) {
    return {
      name: leave.employeeName,
      email: leave.employeeEmail || '',
      id: leave.employeeId || '',
      avatar: (leave.employeeName[0] || '?').toUpperCase(),
    };
  }
  return { name: 'Unknown', email: '', id: '', avatar: '?' };
};

const getAvatarBg = (char) => {
  const code = char.charCodeAt(0);
  const colors = [
    'bg-blue-50 text-blue-600 border-blue-100',
    'bg-indigo-50 text-indigo-600 border-indigo-100',
    'bg-purple-50 text-purple-600 border-purple-100',
    'bg-pink-50 text-pink-600 border-pink-100',
    'bg-cyan-50 text-cyan-600 border-cyan-100',
    'bg-teal-50 text-teal-600 border-teal-100',
  ];
  return colors[code % colors.length];
};

const HRLeaveTable = ({ leaves, onActionClick, loading, actionLoading }) => {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const safeLeaves = Array.isArray(leaves) ? leaves : [];

  const filteredLeaves = safeLeaves.filter(leave => {
    const emp = getEmployeeInfo(leave);
    const matchesFilter = filter === 'All' || leave.status === filter;
    const searchLower = search.toLowerCase();
    const matchesSearch = 
      emp.name.toLowerCase().includes(searchLower) ||
      emp.email.toLowerCase().includes(searchLower) ||
      emp.id.toLowerCase().includes(searchLower) ||
      (leave.reason || '').toLowerCase().includes(searchLower);
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
        <div className="h-10 bg-slate-100 rounded-xl w-1/3 animate-pulse" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-150/60 shadow-sm overflow-hidden">
      
      {/* Search & Filter Header */}
      <div className="p-6 border-b border-slate-100 bg-slate-50/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Filter className="w-5 h-5 text-orange-500" />
            Inbox Requests
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Filter, review and update pending leaves</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search employee, reason..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#EA580C] w-full sm:w-64 transition-all"
            />
          </div>
          
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {['All', 'Pending', 'Approved', 'Rejected'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  filter === f 
                    ? 'bg-white text-orange-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredLeaves.length === 0 ? (
        <div className="text-center py-16 bg-white">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <Filter className="w-6 h-6 text-slate-300" />
          </div>
          <p className="text-sm font-semibold text-slate-700">No matching requests</p>
          <p className="text-xs text-slate-400 mt-1">There are no leave requests matching your current filter.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/20">
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Employee</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Request Date</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Reason Details</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeaves.map((leave) => {
                const emp = getEmployeeInfo(leave);
                return (
                  <tr key={leave._id || leave.id || Math.random()} className="hover:bg-slate-50/30 transition-colors">
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border ${getAvatarBg(emp.avatar)}`}>
                          {emp.avatar}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-sm leading-none">{emp.name}</p>
                          {emp.email && <p className="text-xs text-slate-400 mt-1 leading-none">{emp.email}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-6 text-sm text-slate-600 font-medium whitespace-nowrap">
                      {leave.date ? new Date(leave.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                    </td>
                    <td className="py-5 px-6">
                      <div className="max-w-xs md:max-w-md">
                        <p className="text-sm text-slate-700 font-medium truncate" title={leave.reason}>
                          {leave.reason || 'No reason provided'}
                        </p>
                        {leave.hrComment && (
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 mt-1.5 rounded bg-slate-50 border border-slate-100 text-xs text-slate-500">
                            <MessageSquare className="w-3 h-3 text-slate-400" />
                            <span className="font-medium text-slate-500">HR:</span>
                            <span className="italic">{leave.hrComment}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <LeaveBadge status={leave.status || 'Pending'} />
                    </td>
                    <td className="py-5 px-6 text-right whitespace-nowrap">
                      {(leave.status === 'Pending' || !leave.status) ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onActionClick(leave, 'Approved')}
                            disabled={actionLoading}
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-500 text-emerald-700 hover:text-white border border-emerald-200/50 hover:border-transparent text-xs font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-sm"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Approve
                          </button>
                          <button
                            onClick={() => onActionClick(leave, 'Rejected')}
                            disabled={actionLoading}
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-500 text-red-700 hover:text-white border border-red-200/50 hover:border-transparent text-xs font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-sm"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-slate-400 tracking-wider uppercase bg-slate-50 px-2 py-1 rounded-md border border-slate-100">Processed</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HRLeaveTable;