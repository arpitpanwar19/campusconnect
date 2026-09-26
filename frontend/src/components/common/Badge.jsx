import React from 'react';

export const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-gray-100 text-text-secondary border border-gray-200',
    accent: 'bg-[var(--color-accent-light)] text-[var(--color-accent)] border border-[var(--color-accent-light)]',
    success: 'bg-green-100 text-[var(--color-success)] border border-green-200',
    warning: 'bg-yellow-100 text-[var(--color-warning)] border border-yellow-200',
    error: 'bg-red-100 text-[var(--color-error)] border border-red-200'
  };
  
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};