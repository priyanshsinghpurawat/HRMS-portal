import React, { useState } from 'react';
import { Search, Filter, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import LeaveBadge from '../Employeedashboard/LeaveBadge';

const Skeleton = () => (
  <div className="animate-pulse bg-gray-200 rounded-lg h-16 w-full" />
);

// Backend returns employeeId as: { _id, name, email } (populated object)
const getEmployeeInfo = (leave) => {
  // Case 1: employeeId is populated object { _id, name, email }
  if (leave?.employeeId && typeof leave.employeeId === 'object' && leave.employeeId.name) {
    return {
      name: leave.employeeId.name,
      email: leave.employeeId.email || '',
      id: leave.employeeId._id || leave.employeeId.id || '',
      avatar: (leave.employeeId.name[0] || '?').toUpperCase(),
    };
  }
  
  // Case 2: employeeId is string (not populated)
  if (leave?.employeeId && typeof leave.employeeId === 'string') {
    return { name: 'Unknown', email: '', id: leave.employeeId, avatar: '?' };
  }
  
  // Case 3: nested employee object
  if (leave?.employee && typeof leave.employee === 'object') {
    return {
      name: leave.employee.name || 'Unknown',
      email: leave.employee.email || '',
      id: leave.employee._id || leave.employee.id || '',
      avatar: (leave.employee.name?.[0] || '?').toUpperCase(),
    };
  }
  
  // Case 4: flat fields
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="h-10 bg-gray-200 rounded w-full mb-4 animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Filter className="w-5 h-5 text-orange-500" />
          Leave Requests
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or reason..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 w-full sm:w-64 transition-all"
            />
          </div>
          
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
            {['All', 'Pending', 'Approved', 'Rejected'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  filter === f 
                    ? 'bg-white text-orange-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredLeaves.length === 0 ? (
        <div className="text-center py-12">
          <Filter className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">No leave requests found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reason</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLeaves.map((leave) => {
                const emp = getEmployeeInfo(leave);
                return (
                  <tr key={leave._id || leave.id || Math.random()} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-semibold text-sm">
                          {emp.avatar}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{emp.name}</p>
                          {emp.email && <p className="text-xs text-gray-500">{emp.email}</p>}
                          {emp.id && <p className="text-xs text-gray-400">ID: {emp.id}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-700 whitespace-nowrap">
                      {leave.date ? new Date(leave.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-gray-700 max-w-xs truncate" title={leave.reason}>
                        {leave.reason || 'No reason provided'}
                      </p>
                      {leave.hrComment && (
                        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {leave.hrComment}
                        </p>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <LeaveBadge status={leave.status || 'Pending'} />
                    </td>
                    <td className="py-4 px-4 text-right">
                      {(leave.status === 'Pending' || !leave.status) ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onActionClick(leave, 'Approved')}
                            disabled={actionLoading}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Approve
                          </button>
                          <button
                            onClick={() => onActionClick(leave, 'Rejected')}
                            disabled={actionLoading}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 italic">Processed</span>
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