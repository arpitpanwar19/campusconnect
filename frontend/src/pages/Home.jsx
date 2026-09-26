import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useRecommendedEvents, useEvents } from '../api/events';
import { useNaturalSearch } from '../api/ai';
import { Spinner } from '../components/common/Spinner';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { Search, ArrowRight, Sparkles, MapPin, Clock, Calendar } from 'lucide-react';
import { format, isToday, isTomorrow, addDays, startOfDay } from 'date-fns';
import { useState } from 'react';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const EventRow = ({ event, showMatch = false }) => {
  const navigate = useNavigate();
  const eventDate = new Date(event.event_date + 'T00:00:00');

  return (
    <button
      onClick={() => navigate(`/events/${event.slug}`)}
      className="w-full text-left py-4 border-b border-border last:border-0 hover:bg-gray-50/50 transition-colors group flex items-start justify-between gap-4"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors truncate">
            {event.title}
          </h3>
          {event.category && (
            <Badge variant="default">{event.category}</Badge>
          )}
        </div>
        <div className="flex items-center gap-4 text-xs text-text-muted">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
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
        {showMatch && event.match_reasons && event.match_reasons.length > 0 && (
          <p className="mt-1 text-xs text-text-muted">
            <Sparkles className="h-3 w-3 inline mr-1" />
            {event.match_reasons.join(' · ')}
          </p>
        )}
      </div>
      {showMatch && event.match_score != null && (
        <div className="shrink-0 text-right">
          <span className="text-sm font-semibold text-accent">{Math.round(event.match_score)}%</span>
          <span className="block text-xs text-text-muted">match</span>
        </div>
      )}
    </button>
  );
};

export const Home = () => {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const firstName = user?.full_name?.split(' ')[0] || 'there';

  // Recommended events
  const { data: recommended, isLoading: recLoading } = useRecommendedEvents();

  // Upcoming events (next 7 days)
  const today = format(new Date(), 'yyyy-MM-dd');
  const nextWeek = format(addDays(new Date(), 7), 'yyyy-MM-dd');
  const { data: upcomingData, isLoading: upcomingLoading } = useEvents({
    date_from: today,
    date_to: nextWeek,
    page_size: 30,
  });

  const upcomingEvents = upcomingData?.items || [];

  // Group upcoming events by day
  const grouped = useMemo(() => {
    const todayEvents = [];
    const tomorrowEvents = [];
    const thisWeekEvents = [];

    upcomingEvents.forEach((event) => {
      const eventDate = new Date(event.event_date + 'T00:00:00');
      if (isToday(eventDate)) {
        todayEvents.push(event);
      } else if (isTomorrow(eventDate)) {
        tomorrowEvents.push(event);
      } else {
        thisWeekEvents.push(event);
      }
    });

    return { todayEvents, tomorrowEvents, thisWeekEvents };
  }, [upcomingEvents]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/discover?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="space-y-10">
      {/* Greeting */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">
          {getGreeting()}, {firstName}.
        </h1>
      </div>

      {/* Search */}
      <div>
        <p className="text-sm text-text-secondary mb-3">What are you looking for?</p>
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Try "AI events this weekend" or "hackathon"'
            className="w-full pl-10 pr-4 py-3 text-sm border border-border rounded-md bg-surface placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
          />
        </form>
      </div>

      {/* Recommended */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">Recommended for you</h2>
        </div>

        {recLoading ? (
          <div className="py-8 flex justify-center"><Spinner /></div>
        ) : recommended && recommended.length > 0 ? (
          <div className="border-t border-border">
            {recommended.slice(0, 5).map((event) => (
              <EventRow key={event.id} event={event} showMatch />
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-muted py-4">
            Complete your profile to get personalized recommendations.
          </p>
        )}
      </section>

      {/* Upcoming on campus */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">Upcoming on campus</h2>
          <Link to="/calendar" className="text-sm text-accent hover:text-accent-hover flex items-center gap-1">
            View full calendar <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {upcomingLoading ? (
          <div className="py-8 flex justify-center"><Spinner /></div>
        ) : upcomingEvents.length === 0 ? (
          <EmptyState title="No upcoming events" description="Check back later for new events." />
        ) : (
          <div className="space-y-6">
            {grouped.todayEvents.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Today</h3>
                <div className="border-t border-border">
                  {grouped.todayEvents.map((e) => <EventRow key={e.id} event={e} />)}
                </div>
              </div>
            )}
            {grouped.tomorrowEvents.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Tomorrow</h3>
                <div className="border-t border-border">
                  {grouped.tomorrowEvents.map((e) => <EventRow key={e.id} event={e} />)}
                </div>
              </div>
            )}
            {grouped.thisWeekEvents.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">This week</h3>
                <div className="border-t border-border">
                  {grouped.thisWeekEvents.map((e) => <EventRow key={e.id} event={e} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};
