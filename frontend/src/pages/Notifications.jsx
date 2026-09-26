import React from 'react';
import { useNotifications, useMarkAllRead, useMarkRead } from '../api/notifications';
import { Spinner } from '../components/common/Spinner';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const Notifications = () => {
  const { data: notifications, isLoading } = useNotifications();
  const markAllRead = useMarkAllRead();
  const markRead = useMarkRead();

  if (isLoading) {
    return <div className="py-12 flex justify-center"><Spinner /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-border">
        <h1 className="text-2xl font-bold text-text-primary">Notifications</h1>
        {notifications?.some(n => !n.is_read) && (
          <Button variant="ghost" size="sm" onClick={() => markAllRead.mutate()}>
            Mark all as read
          </Button>
        )}
      </div>

      {!notifications?.length ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="You're all caught up. Notifications will appear here when you register for events or receive updates."
        />
      ) : (
        <div className="divide-y divide-border">
          {notifications.map(n => (
            <div
              key={n.id}
              onClick={() => !n.is_read && markRead.mutate(n.id)}
              className={
                'py-4 px-3 -mx-3 rounded-md cursor-pointer transition-colors ' +
                (n.is_read ? 'opacity-60' : 'hover:bg-gray-50')
              }
            >
              <div className="flex items-start gap-3">
                {!n.is_read && (
                  <div className="w-2 h-2 rounded-full bg-accent mt-1.5 flex-shrink-0" />
                )}
                <div className={n.is_read ? 'ml-5' : ''}>
                  <h4 className="text-sm font-semibold text-text-primary">{n.title}</h4>
                  <p className="text-sm text-text-secondary mt-0.5">{n.message}</p>
                  <p className="text-xs text-text-muted mt-2">
                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
