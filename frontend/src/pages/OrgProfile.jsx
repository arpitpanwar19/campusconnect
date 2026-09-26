import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrganization } from '../api/organizations';
import { useEvents } from '../api/events';
import { Spinner } from '../components/common/Spinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { EmptyState } from '../components/common/EmptyState';
import { Badge } from '../components/common/Badge';
import { CheckCircle, Calendar, MapPin, Clock } from 'lucide-react';
import { format } from 'date-fns';

export const OrgProfile = () => {
  const { slug } = useParams();
  const { data: org, isLoading, error } = useOrganization(slug);
  const { data: eventsData } = useEvents({ org_id: org?.id, page_size: 50 });

  if (isLoading) return <div className="py-12 flex justify-center"><Spinner /></div>;
  if (error || !org) return <ErrorMessage message="Organization not found" />;

  const events = eventsData?.items || [];
  const today = new Date().toISOString().split('T')[0];
  const upcomingEvents = events.filter(e => e.event_date >= today);
  const pastEvents = events.filter(e => e.event_date < today);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center text-2xl font-bold text-text-muted flex-shrink-0">
          {org.logo_url ? (
            <img src={org.logo_url} alt={org.name} className="w-full h-full object-cover rounded-md" />
          ) : (
            org.name.charAt(0)
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-text-primary">{org.name}</h1>
            {org.is_verified && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-accent">
                <CheckCircle className="h-4 w-4" /> Verified
              </span>
            )}
          </div>
          <p className="text-sm text-text-muted mt-0.5 capitalize">{org.type}</p>
          {org.description && (
            <p className="text-sm text-text-secondary mt-2 leading-relaxed">{org.description}</p>
          )}
        </div>
      </div>

      {/* Upcoming Events */}
      <section>
        <h2 className="text-lg font-semibold text-text-primary mb-3">
          Upcoming Events
          {upcomingEvents.length > 0 && (
            <span className="text-sm font-normal text-text-muted ml-2">({upcomingEvents.length})</span>
          )}
        </h2>
        {upcomingEvents.length === 0 ? (
          <EmptyState title="No upcoming events" description="This organization hasn't published any upcoming events." />
        ) : (
          <div className="border-t border-border">
            {upcomingEvents.map(event => (
              <Link
                key={event.id}
                to={'/events/' + event.slug}
                className="flex items-start justify-between py-4 border-b border-border hover:bg-gray-50/50 transition-colors group"
              >
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-text-primary group-hover:text-accent truncate">
                    {event.title}
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-text-muted mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(event.event_date + 'T00:00:00'), 'MMM d, yyyy')}
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
                <Badge variant="default">{event.category}</Badge>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-text-primary mb-3">
            Past Events
            <span className="text-sm font-normal text-text-muted ml-2">({pastEvents.length})</span>
          </h2>
          <div className="border-t border-border">
            {pastEvents.map(event => (
              <Link
                key={event.id}
                to={'/events/' + event.slug}
                className="flex items-center justify-between py-3 border-b border-border opacity-60 hover:opacity-100 transition-opacity group"
              >
                <div className="min-w-0">
                  <h3 className="text-sm font-medium text-text-primary group-hover:text-accent truncate">
                    {event.title}
                  </h3>
                  <p className="text-xs text-text-muted mt-0.5">
                    {format(new Date(event.event_date + 'T00:00:00'), 'MMM d, yyyy')}
                  </p>
                </div>
                <Badge variant="default">{event.category}</Badge>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
