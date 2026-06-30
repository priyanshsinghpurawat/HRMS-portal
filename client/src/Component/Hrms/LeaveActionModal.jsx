import React, { useState } from 'react';
import { X, CheckCircle, XCircle, MessageSquare, Loader2 } from 'lucide-react';

const getEmployeeInfo = (leave) => {
  if (leave?.employeeId && typeof leave.employeeId === 'object' && leave.employeeId.name) {
    return {
      name: leave.employeeId.name,
      email: leave.employeeId.email || '',
    };
  }
  if (leave?.employee && typeof leave.employee === 'object') {
    return {
      name: leave.employee.name || 'Unknown',
      email: leave.employee.email || '',
    };
  }
  if (leave?.employeeName) {
    return { name: leave.employeeName, email: leave.employeeEmail || '' };
  }
  if (leave?.user && typeof leave.user === 'object') {
    return {
      name: leave.user.name || leave.user.fullName || 'Unknown',
      email: leave.user.email || '',
    };
  }
  return { name: 'Unknown', email: '' };
};

const LeaveActionModal = ({ isOpen, onClose, leave, onAction, loading }) => {
  const [hrComment, setHrComment] = useState('');
  const [action, setAction] = useState(null);

  if (!isOpen || !leave) return null;

  const emp = getEmployeeInfo(leave);

  const handleSubmit = () => {
    onAction(leave._id || leave.id, action, hrComment);
  };

  const handleClose = () => {
    setHrComment('');
    setAction(null);
    onClose();
  };

  if (!action) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Review Leave Request</h3>
            <button onClick={handleClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="p-6 space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Employee</p>
                <p className="font-medium text-gray-900">{emp.name}</p>
                {emp.email && <p className="text-sm text-gray-500">{emp.email}</p>}
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Leave Date</p>
                <p className="font-medium text-gray-900">
                  {leave.date ? new Date(leave.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Reason</p>
                <p className="text-gray-700 text-sm">{leave.reason || 'No reason provided'}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setAction('Approved')}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-all active:scale-95"
              >
                <CheckCircle className="w-5 h-5" />
                Approve
              </button>
              <button
                onClick={() => setAction('Rejected')}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-all active:scale-95"
              >
                <XCircle className="w-5 h-5" />
                Reject
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            {action === 'Approved' ? 'Approve' : 'Reject'} Leave
          </h3>
          <button onClick={() => setAction(null)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Employee</p>
            <p className="font-medium text-gray-900">{emp.name}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <MessageSquare className="w-4 h-4 inline mr-1" />
              HR Comment <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <textarea
              value={hrComment}
              onChange={(e) => setHrComment(e.target.value)}
              placeholder="Add a comment for the employee..."
              rows={3}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              onClick={() => setAction(null)}
              className="flex-1 px-4 py-2.5 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-medium rounded-lg transition-all"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`flex-1 px-4 py-2.5 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex items-center justify-center gap-2 ${
                action === 'Approved' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                action === 'Approved' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />
              )}
              Confirm {action === 'Approved' ? 'Approval' : 'Rejection'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveActionModal;