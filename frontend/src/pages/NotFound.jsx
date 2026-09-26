import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';

export const NotFound = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
    <h1 className="text-6xl font-bold text-text-primary mb-4">404</h1>
    <h2 className="text-2xl font-medium text-text-secondary mb-8">Page not found</h2>
    <p className="text-text-muted mb-8 max-w-md">Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.</p>
    <Link to="/"><Button>Return Home</Button></Link>
  </div>
);
