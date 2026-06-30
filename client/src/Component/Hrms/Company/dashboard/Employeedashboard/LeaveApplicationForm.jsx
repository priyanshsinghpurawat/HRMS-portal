import React, { useState } from 'react';
import { Calendar, Send, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const LeaveApplicationForm = ({ onSubmit, loading }) => {
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!date) newErrors.date = 'Please select a leave date';
    if (!reason.trim()) newErrors.reason = 'Please provide a reason for your leave';
    if (reason.trim().length < 5) newErrors.reason = 'Reason must be at least 5 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ date, reason });
    setDate('');
    setReason('');
    setErrors({});
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
          <Calendar className="w-4 h-4 text-orange-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">Apply for Leave</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Leave Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => { setDate(e.target.value); if (errors.date) setErrors(p => ({...p, date: ''})); }}
            min={today}
            className={`w-full px-3 py-2.5 border rounded-lg outline-none transition-all focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
              errors.date ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errors.date && <p className="mt-1 text-xs text-red-600">{errors.date}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => { setReason(e.target.value); if (errors.reason) setErrors(p => ({...p, reason: ''})); }}
            placeholder="Describe your reason for leave..."
            rows={4}
            className={`w-full px-3 py-2.5 border rounded-lg outline-none transition-all resize-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
              errors.reason ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errors.reason && <p className="mt-1 text-xs text-red-600">{errors.reason}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Submit Leave Request
        </button>
      </form>
    </div>
  );
};

export default LeaveApplicationForm;