import React from 'react';

const StatCard = ({ value, label, icon, className = '' }) => {
  return (
    <div className={`text-center ${className}`}>
      {icon && <div className="text-2xl mb-1">{icon}</div>}
      <div className="text-3xl font-bold text-[#0F172A]">{value}</div>
      <div className="text-sm text-[#64748B] font-medium mt-0.5">{label}</div>
    </div>
  );
};

export default StatCard;