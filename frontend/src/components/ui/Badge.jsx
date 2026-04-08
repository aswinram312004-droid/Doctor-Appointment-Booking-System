import React from 'react';

const Badge = ({ children, color = 'blue', className = '' }) => {
  const colors = {
    blue: 'bg-[#E0F2FE] text-[#0284C7]',
    green: 'bg-green-100 text-green-700',
    purple: 'bg-purple-100 text-purple-700',
    orange: 'bg-orange-100 text-orange-700',
    red: 'bg-red-100 text-red-700',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${colors[color]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;   