import React from 'react';
import { Button } from './Button';
import { AlertCircle } from 'lucide-react';

export const ErrorMessage = ({ message = 'Something went wrong', onRetry }) => (
  <div className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-md border border-red-100 text-center">
    <AlertCircle className="h-8 w-8 text-[var(--color-error)] mb-3" />
    <p className="text-sm text-[var(--color-error)] mb-4">{message}</p>
    {onRetry && <Button variant="secondary" size="sm" onClick={onRetry}>Try Again</Button>}
  </div>
);