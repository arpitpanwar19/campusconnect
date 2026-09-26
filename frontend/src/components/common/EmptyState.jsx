import React from 'react';

export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
    {Icon && <div className="p-3 bg-gray-50 rounded-full mb-4"><Icon className="h-8 w-8 text-text-muted" /></div>}
    <h3 className="text-lg font-medium text-text-primary mb-1">{title}</h3>
    {description && <p className="text-sm text-text-secondary mb-6 max-w-sm">{description}</p>}
    {action}
  </div>
);