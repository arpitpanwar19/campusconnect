import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/common/Button';

export const OrgDashboard = () => {
  const { user } = useAuthStore();
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Organizer Dashboard</h1>
          <p className="text-text-secondary mt-1">Manage your organization's events.</p>
        </div>
        <Link to="/organizer/events/new">
          <Button>Create Event</Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-surface border border-border rounded-md">
          <p className="text-sm font-medium text-text-secondary">Upcoming Events</p>
          <p className="text-3xl font-bold text-text-primary mt-2">0</p>
        </div>
        <div className="p-6 bg-surface border border-border rounded-md">
          <p className="text-sm font-medium text-text-secondary">Total Registrations</p>
          <p className="text-3xl font-bold text-text-primary mt-2">0</p>
        </div>
        <div className="p-6 bg-surface border border-border rounded-md">
          <p className="text-sm font-medium text-text-secondary">Total Views</p>
          <p className="text-3xl font-bold text-text-primary mt-2">0</p>
        </div>
      </div>
      
      <div className="pt-8 border-t border-border">
        <h2 className="text-xl font-bold text-text-primary mb-4">Your Events</h2>
        <div className="text-center py-12 text-text-secondary">
          <p>No events found. Create your first event to get started.</p>
        </div>
      </div>
    </div>
  );
};
