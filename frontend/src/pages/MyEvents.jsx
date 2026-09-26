import React, { useState } from 'react';
import { useMyRegistrations } from '../api/registrations';
import { useMyBookmarks } from '../api/bookmarks';
import { Spinner } from '../components/common/Spinner';
import { EmptyState } from '../components/common/EmptyState';
import { Badge } from '../components/common/Badge';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, MapPin, CheckCircle, Star, Clock } from 'lucide-react';

const TABS = [
  { id: 'registered', label: 'Registered' },
  { id: 'saved', label: 'Saved' },
];

const EventItem = ({ event, type }) => {
  const eventDate = new Date(event.event_date + 'T00:00:00');

  return (
    <Link
      to={'/events/' + event.slug}
      className="flex items-start justify-between py-4 border-b border-border hover:bg-gray-50/50 transition-colors group"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors truncate">
            {event.title}
          </h3>
          {type === 'registered' && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
              <CheckCircle className="h-3 w-3" /> Registered
            </span>
          )}
          {type === 'saved' && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-accent">
              <Star className="h-3 w-3 fill-current" /> Saved
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 text-xs text-text-muted">
          <span className="flex items-center gap-1">
            <CalendarIcon className="h-3 w-3" />
            {format(eventDate, 'MMM d, yyyy')}
          </span>
          {event.start_time && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {event.start_time.slice(0, 5)}
            </span>
          )}
          {event.venue && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {event.venue}
            </span>
          )}
        </div>
      </div>
      {event.category && <Badge variant="default">{event.category}</Badge>}
    </Link>
  );
};

export const MyEvents = () => {
  const [activeTab, setActiveTab] = useState('registered');
  const { data: registrations, isLoading: loadingReg } = useMyRegistrations();
  const { data: bookmarks, isLoading: loadingBook } = useMyBookmarks();

  const registeredEvents = registrations?.upcoming || [];
  const pastEvents = registrations?.past || [];
  const savedEvents = bookmarks || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">My Events</h1>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex -mb-px">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={
                'py-3 px-4 text-sm font-medium border-b-2 transition-colors ' +
                (activeTab === tab.id
                  ? 'border-accent text-accent'
                  : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-300')
              }
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'registered' && (
        loadingReg ? (
          <div className="py-8 flex justify-center"><Spinner /></div>
        ) : registeredEvents.length === 0 && pastEvents.length === 0 ? (
          <EmptyState
            icon={CalendarIcon}
            title="No registered events"
            description="Browse events and register for ones that interest you."
          />
        ) : (
          <div className="space-y-6">
            {registeredEvents.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Upcoming</h3>
                <div className="border-t border-border">
                  {registeredEvents.map(item => (
                    <EventItem key={item.event?.id || item.id} event={item.event || item} type="registered" />
                  ))}
                </div>
              </div>
            )}
            {pastEvents.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Past</h3>
                <div className="border-t border-border">
                  {pastEvents.map(item => (
                    <EventItem key={item.event?.id || item.id} event={item.event || item} type="registered" />
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      )}

      {activeTab === 'saved' && (
        loadingBook ? (
          <div className="py-8 flex justify-center"><Spinner /></div>
        ) : savedEvents.length === 0 ? (
          <EmptyState
            icon={Star}
            title="No saved events"
            description="Bookmark events to save them for later."
          />
        ) : (
          <div className="border-t border-border">
            {savedEvents.map(item => (
              <EventItem key={item.event?.id || item.id} event={item.event || item} type="saved" />
            ))}
          </div>
        )
      )}
    </div>
  );
};
