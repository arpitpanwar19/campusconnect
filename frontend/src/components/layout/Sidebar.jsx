import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUiStore } from '../../store/uiStore';

export const Sidebar = ({ links }) => {
  const { sidebarOpen, setSidebarOpen } = useUiStore();
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={
          'fixed inset-y-0 left-0 z-40 w-64 bg-surface border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:block ' +
          (sidebarOpen ? 'translate-x-0' : '-translate-x-full')
        }
      >
        <div className="p-4">
          <nav className="space-y-1 mt-4">
            {links.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className={
                    'flex items-center px-3 py-2 text-sm font-medium rounded-md ' +
                    (isActive
                      ? 'bg-accent/10 text-accent'
                      : 'text-text-secondary hover:bg-gray-50 hover:text-text-primary')
                  }
                >
                  {link.icon && <link.icon className="mr-3 h-5 w-5" />}
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
};
