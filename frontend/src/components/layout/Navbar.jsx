import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useUnreadCount } from '../../api/notifications';
import { Bell, Menu, X, User, LogOut } from 'lucide-react';
import { Button } from '../common/Button';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/discover', label: 'Discover' },
  { href: '/calendar', label: 'Calendar' },
  { href: '/my-events', label: 'My Events' },
];

export const Navbar = () => {
  const { user, logout } = useAuthStore();
  const { data: unreadCount } = useUnreadCount();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const unread = unreadCount?.count || 0;

  return (
    <nav className="sticky top-0 z-40 w-full bg-surface border-b border-border">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-8">
          <Link to="/" className="text-lg font-bold text-text-primary tracking-tight">
            CampusConnect
          </Link>
          {user && (
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(link => {
                const isActive = location.pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={
                      'px-3 py-1.5 text-sm font-medium rounded-md transition-colors ' +
                      (isActive
                        ? 'text-accent bg-accent/5'
                        : 'text-text-secondary hover:text-text-primary hover:bg-gray-50')
                    }
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Organizer link */}
              {(user.role === 'organizer' || user.role === 'admin') && (
                <Link
                  to="/organizer/dashboard"
                  className="hidden sm:block text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
                >
                  Dashboard
                </Link>
              )}
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className="hidden sm:block text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
                >
                  Admin
                </Link>
              )}

              {/* Notifications */}
              <Link
                to="/notifications"
                className="relative p-2 text-text-secondary hover:text-text-primary hover:bg-gray-50 rounded-md transition-colors"
              >
                <Bell className="h-4.5 w-4.5" />
                {unread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center text-[10px] font-bold text-white bg-accent rounded-full px-1">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </Link>

              {/* User menu */}
              <div className="flex items-center gap-2">
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-medium text-text-primary">{user.full_name}</p>
                  <p className="text-[10px] text-text-muted capitalize">{user.role}</p>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-text-muted hover:text-text-primary hover:bg-gray-50 rounded-md transition-colors"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login"><Button variant="ghost" size="sm">Log in</Button></Link>
              <Link to="/signup"><Button variant="primary" size="sm">Sign up</Button></Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-text-secondary"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && user && (
        <div className="md:hidden border-t border-border bg-surface px-4 py-3 space-y-1">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setMobileOpen(false)}
              className={
                'block px-3 py-2 text-sm rounded-md ' +
                (location.pathname === link.href
                  ? 'text-accent bg-accent/5 font-medium'
                  : 'text-text-secondary')
              }
            >
              {link.label}
            </Link>
          ))}
          {(user.role === 'organizer' || user.role === 'admin') && (
            <Link
              to="/organizer/dashboard"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 text-sm text-text-secondary rounded-md"
            >
              Dashboard
            </Link>
          )}
          {user.role === 'admin' && (
            <Link
              to="/admin"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 text-sm text-text-secondary rounded-md"
            >
              Admin
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};