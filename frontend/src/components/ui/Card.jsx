import React from 'react';

const Card = ({ children, className = '', hover = true, glass = false }) => {
  return (
    <div
      className={`
        rounded-3xl p-6
        ${glass ? 'glass' : 'bg-white shadow-sm border border-slate-100'}
        ${hover ? 'hover:shadow-xl hover:-translate-y-1 transition-all duration-300' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;