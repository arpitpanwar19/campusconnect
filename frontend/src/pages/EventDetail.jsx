import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useEvent } from '../api/events';
import { useRegister, useCancelRegistration } from '../api/registrations';
import { useToggleBookmark } from '../api/bookmarks';
import { Spinner } from '../components/common/Spinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Calendar as CalendarIcon, MapPin, Clock, CheckCircle, Star, Users, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

export const EventDetail = () => {
  const { slug } = useParams();
  const { data: event, isLoading, error, refetch } = useEvent(slug);

  const register = useRegister();
  const cancelReg = useCancelRegistration();
  const toggleBookmark = useToggleBookmark();

  if (isLoading) {
    return <div className="py-16 flex justify-center"><Spinner size="lg" /></div>;
  }

  if (error || !event) {
    return <ErrorMessage message="Failed to load event details" onRetry={refetch} />;
  }

  const eventDate = new Date(event.event_date + 'T00:00:00');
  const isRegistered = event.is_registered;
  const isBookmarked = event.is_bookmarked;
  const registrationCount = event.registration_count || 0;

  const handleRegister = async () => {
    try {
      await register.mutateAsync({ event_id: event.id });
      refetch();
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  const handleCancelRegistration = async () => {
    try {
      await cancelReg.mutateAsync(event.id);
      refetch();
    } catch (err) {
      console.error('Cancel failed:', err);
    }
  };

  const handleToggleBookmark = async () => {
    try {
      await toggleBookmark.mutateAsync(event.id);
      refetch();
    } catch (err) {
      console.error('Bookmark failed:', err);
    }
  };

  const deadlinePassed = event.registration_deadline
    ? new Date(event.registration_deadline) < new Date()
    : false;

  const atCapacity = event.capacity ? registrationCount >= event.capacity : false;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <header className="space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            {event.category && <Badge variant="default">{event.category}</Badge>}
            {event.is_free === false && <Badge variant="warning">Paid</Badge>}
            {event.status === 'cancelled' && <Badge variant="error">Cancelled</Badge>}
          </div>
          <button
            onClick={handleToggleBookmark}
            className="p-2 hover:bg-gray-50 rounded-md transition-colors"
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark event'}
          >
            <Star className={'h-5 w-5 ' + (isBookmarked ? 'fill-accent text-accent' : 'text-text-muted')} />
          </button>
        </div>

        <h1 className="text-3xl font-bold text-text-primary tracking-tight">
          {event.title}
        </h1>

        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <span>Organized by</span>
          {event.org_name ? (
            <span className="font-medium text-text-primary">{event.org_name}</span>
          ) : (
            <span className="font-medium text-text-primary">Organization</span>
          )}
          {event.org_verified && (
            <span className="inline-flex items-center gap-1 text-accent text-xs font-medium">
              <CheckCircle className="h-3.5 w-3.5" /> Verified
            </span>
          )}
        </div>
      </header>

      {/* Event Info Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-6 border-y border-border">
        <div className="flex items-center gap-3">
          <CalendarIcon className="h-5 w-5 text-text-muted flex-shrink-0" />
          <div>
            <p className="text-xs text-text-muted">Date</p>
            <p className="text-sm font-medium text-text-primary">{format(eventDate, 'EEEE, MMMM d, yyyy')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-text-muted flex-shrink-0" />
          <div>
            <p className="text-xs text-text-muted">Time</p>
            <p className="text-sm font-medium text-text-primary">
              {event.start_time?.slice(0, 5)}{event.end_time ? ' – ' + event.end_time.slice(0, 5) : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <MapPin className="h-5 w-5 text-text-muted flex-shrink-0" />
          <div>
            <p className="text-xs text-text-muted">Venue</p>
            <p className="text-sm font-medium text-text-primary">{event.venue || 'TBA'}</p>
          </div>
        </div>
        {event.capacity && (
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-text-muted flex-shrink-0" />
            <div>
              <p className="text-xs text-text-muted">Registrations</p>
              <p className="text-sm font-medium text-text-primary">{registrationCount} / {event.capacity}</p>
            </div>
          </div>
        )}
      </div>

      {/* Main content + sidebar */}
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Main content */}
        <main className="flex-[2] space-y-8 min-w-0">
          {/* Description */}
          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">About</h2>
            <div className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
              {event.description || 'No description provided.'}
            </div>
          </section>

          {/* Eligibility */}
          {event.eligibility && (
            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-3">Who should attend</h2>
              <p className="text-sm text-text-secondary">{event.eligibility}</p>
            </section>
          )}

          {/* Benefits */}
          {event.benefits && (
            <section>
              <h2 className="text-lg font-semibold text-text-primary mb-3">What you get</h2>
              <p className="text-sm text-text-secondary">{event.benefits}</p>
            </section>
          )}

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {event.tags.map(tag => (
                  <Badge key={tag} variant="default">{tag}</Badge>
                ))}
              </div>
            </section>
          )}

          {/* Contact */}
          {event.contact_info && (
            <section>
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Contact</h3>
              <p className="text-sm text-text-secondary">{event.contact_info}</p>
            </section>
          )}
        </main>

        {/* Registration sidebar */}
        <aside className="lg:w-72 flex-shrink-0">
          <div className="border border-border rounded-md p-5 sticky top-20">
            <h3 className="text-base font-semibold text-text-primary mb-1">Registration</h3>
            <p className="text-xs text-text-muted mb-5">
              {event.is_free !== false ? 'Free to attend' : 'Paid event'}
              {event.registration_deadline && (
                <> · Deadline: {format(new Date(event.registration_deadline), 'MMM d, yyyy')}</>
              )}
            </p>

            {event.status === 'cancelled' ? (
              <div className="text-sm text-error font-medium text-center py-3">
                This event has been cancelled.
              </div>
            ) : isRegistered ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 py-2.5 px-4 bg-green-50 border border-green-200 rounded-md text-sm font-medium text-success">
                  <CheckCircle className="h-4 w-4" /> Registered
                </div>
                <button
                  onClick={handleCancelRegistration}
                  className="w-full text-center text-xs text-text-muted hover:text-error transition-colors py-1"
                >
                  Cancel registration
                </button>
              </div>
            ) : deadlinePassed ? (
              <div className="text-sm text-text-muted text-center py-3">
                Registration deadline has passed.
              </div>
            ) : atCapacity ? (
              <div className="text-sm text-text-muted text-center py-3">
                Event is at full capacity.
              </div>
            ) : event.registration_link ? (
              <a
                href={event.registration_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-accent text-white rounded-md text-sm font-medium hover:bg-accent-hover transition-colors"
              >
                Register <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : (
              <Button
                variant="primary"
                className="w-full"
                onClick={handleRegister}
                loading={register.isPending}
              >
                Register
              </Button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};
