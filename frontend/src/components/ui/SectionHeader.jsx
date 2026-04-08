import React from 'react';

const SectionHeader = ({ badge, title, highlight, subtitle, center = true }) => {
  return (
    <div className={`mb-12 ${center ? 'text-center' : ''}`}>
      {badge && (
        <span className="inline-block bg-[#E0F2FE] text-[#0284C7] text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
          {badge}
        </span>
      )}
      <h2 className="text-4xl font-bold text-[#0F172A] leading-tight mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>
        {title}{' '}
        {highlight && <span className="text-gradient">{highlight}</span>}
      </h2>
      {subtitle && (
        <p className="text-[#64748B] text-lg max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionHeader;