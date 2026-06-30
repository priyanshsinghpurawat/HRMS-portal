import React from 'react';
import { Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, colorClass }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </div>
);

const LeaveStatsCards = ({ leaves }) => {
  const total = leaves.length;
  const pending = leaves.filter(l => l.status === 'Pending').length;
  const approved = leaves.filter(l => l.status === 'Approved').length;
  const rejected = leaves.filter(l => l.status === 'Rejected').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard icon={Calendar} label="Total Requests" value={total} colorClass="bg-orange-100 text-orange-600" />
      <StatCard icon={Clock} label="Pending" value={pending} colorClass="bg-amber-100 text-amber-600" />
      <StatCard icon={CheckCircle} label="Approved" value={approved} colorClass="bg-emerald-100 text-emerald-600" />
      <StatCard icon={XCircle} label="Rejected" value={rejected} colorClass="bg-red-100 text-red-600" />
    </div>
  );
};

export default LeaveStatsCards;