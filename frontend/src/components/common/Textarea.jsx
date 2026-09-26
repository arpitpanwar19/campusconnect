import React, { forwardRef } from 'react';

export const Textarea = forwardRef(({ label, error, className = '', ...props }, ref) => {
  return (
    <div className="w-full flex flex-col gap-1.5 mb-4">
      {label && <label className="text-sm font-medium text-text-primary">{label}</label>}
      <textarea
        ref={ref}
        className={`w-full px-3 py-2 bg-surface border ${error ? 'border-error focus:ring-error' : 'border-border focus:ring-accent'} rounded-md focus:outline-none focus:ring-2 focus:border-transparent text-sm text-text-primary placeholder:text-text-muted min-h-[100px] resize-y ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-[var(--color-error)]">{error}</span>}
    </div>
  );
});