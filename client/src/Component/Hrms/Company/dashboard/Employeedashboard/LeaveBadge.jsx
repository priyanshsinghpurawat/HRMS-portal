import React from 'react';

const LeaveBadge = ({ status }) => {
  const styles = {
    Pending: 'bg-amber-100 text-amber-800 border-amber-200',
    Approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Rejected: 'bg-red-100 text-red-800 border-red-200',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles['Pending']}`}>
      {status}
    </span>
  );
};

export default LeaveBadge;