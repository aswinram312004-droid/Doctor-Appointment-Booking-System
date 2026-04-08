import React from 'react';

const variants = {
  primary: 'bg-[#0EA5E9] hover:bg-[#0284C7] text-white shadow-lg shadow-sky-200 hover:shadow-sky-300',
  secondary: 'bg-white hover:bg-[#F0F9FF] text-[#0EA5E9] border-2 border-[#0EA5E9]',
  dark: 'bg-[#0F172A] hover:bg-[#1E293B] text-white',
  ghost: 'bg-transparent hover:bg-[#F0F9FF] text-[#0EA5E9]',
  outline: 'bg-transparent border-2 border-[#0EA5E9] text-[#0EA5E9] hover:bg-white hover:text-[#0EA5E9]',
};

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  icon,
  iconPosition = 'right',
  fullWidth = false,
  onClick,
  type = 'button',
  disabled = false,
  
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-2 font-semibold rounded-2xl
        transition-all duration-300 cursor-pointer select-none
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-0.5 active:translate-y-0'}
        ${className}
      `}
    >
      {icon && iconPosition === 'left' && <span>{icon}</span>}
      {children}
      {icon && iconPosition === 'right' && <span>{icon}</span>}
    </button>
  );
};

export default Button;