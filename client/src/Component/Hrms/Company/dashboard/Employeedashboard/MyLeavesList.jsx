import React from 'react';
import { Calendar, MessageSquare, Clock } from 'lucide-react';
import LeaveBadge from './LeaveBadge';

const Skeleton = () => (
  <div className="animate-pulse bg-gray-200 rounded-lg h-20 w-full" />
);

const MyLeavesList = ({ leaves, loading }) => {
  const safeLeaves = Array.isArray(leaves) ? leaves : [];

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-orange-500" />
        My Leave History
      </h2>

      {safeLeaves.length === 0 ? (
        <div className="text-center py-10">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 text-sm">No leave requests found</p>
          <p className="text-gray-400 text-xs mt-1">Apply for your first leave above</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[28rem] overflow-y-auto pr-1 custom-scrollbar">
          {safeLeaves.map((leave) => (
            <div 
              key={leave._id || leave.id || Math.random()} 
              className="p-4 rounded-lg border border-gray-100 hover:border-orange-200 hover:shadow-sm transition-all bg-gray-50/30"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900 text-sm">
                  {leave.date ? new Date(leave.date).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  }) : 'No date'}
                </span>
                <LeaveBadge status={leave.status || 'Pending'} />
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">{leave.reason || 'No reason provided'}</p>
              {leave.hrComment && (
                <p className="text-xs text-gray-500 mt-2 flex items-start gap-1.5">
                  <MessageSquare className="w-3 h-3 mt-0.5 shrink-0" />
                  <span><span className="font-medium">HR:</span> {leave.hrComment}</span>
                </p>
              )}
              {leave.createdAt && (
                <p className="text-xs text-gray-400 mt-1">
                  Applied on {new Date(leave.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyLeavesList;