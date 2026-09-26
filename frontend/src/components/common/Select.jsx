import React, { forwardRef } from 'react';

export const Select = forwardRef(({ label, error, options = [], className = '', ...props }, ref) => {
  return (
    <div className="w-full flex flex-col gap-1.5 mb-4">
      {label && <label className="text-sm font-medium text-text-primary">{label}</label>}
      <select
        ref={ref}
        className={`w-full px-3 py-2 bg-surface border ${error ? 'border-error focus:ring-error' : 'border-border focus:ring-accent'} rounded-md focus:outline-none focus:ring-2 focus:border-transparent text-sm text-text-primary ${className}`}
        {...props}
      >
        <option value="" disabled>Select an option</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <span className="text-xs text-[var(--color-error)]">{error}</span>}
    </div>
  );
});