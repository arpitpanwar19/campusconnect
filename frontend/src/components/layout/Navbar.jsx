import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Bell, Menu, User } from 'lucide-react';
import { Button } from '../common/Button';

export const Navbar = () => {
  const { user, logout } = useAuthStore();

  return (
    <nav className="sticky top-0 z-40 w-full bg-surface border-b border-border">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-xl font-bold text-text-primary tracking-tight">
            CampusConnect
          </Link>
          {user && (
            <div className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">Home</Link>
              <Link to="/discover" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">Discover</Link>
              <Link to="/calendar" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">Calendar</Link>
              <Link to="/my-events" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">My Events</Link>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/notifications" className="relative p-2 text-text-secondary hover:bg-gray-50 rounded-full">
                <Bell className="h-5 w-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                  <User className="h-5 w-5 text-gray-500" />
                </div>
                <Button variant="ghost" size="sm" onClick={logout} className="hidden sm:inline-flex text-xs">Logout</Button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login"><Button variant="ghost" size="sm">Log in</Button></Link>
              <Link to="/signup"><Button variant="primary" size="sm">Sign up</Button></Link>
            </div>
          )}
          <button className="md:hidden p-2 text-text-secondary">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </nav>
  );
};