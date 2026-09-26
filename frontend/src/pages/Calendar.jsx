import React, { useState, useMemo } from 'react';
import { useCalendarEvents } from '../api/events';
import { Spinner } from '../components/common/Spinner';
import { EmptyState } from '../components/common/EmptyState';
import { Badge } from '../components/common/Badge';
import { Link } from 'react-router-dom';
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

export const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month'); // month, upcoming

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  const { data: events, isLoading } = useCalendarEvents(
    format(monthStart, 'yyyy-MM-dd'),
    format(monthEnd, 'yyyy-MM-dd')
  );

  const days = useMemo(() => {
    const weekStart = startOfWeek(monthStart);
    return eachDayOfInterval({
      start: weekStart,
      end: addDays(weekStart, 41),
    });
  }, [monthStart]);

  const nextMonth = () => setCurrentDate(addDays(monthEnd, 1));
  const prevMonth = () => setCurrentDate(addDays(monthStart, -1));

  const getEventsForDay = (day) => {
    if (!events) return [];
    return events.filter(e => isSameDay(new Date(e.event_date + 'T00:00:00'), day));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-text-primary">Calendar</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center border border-border rounded-md overflow-hidden">
            <button
              onClick={() => setView('month')}
              className={'px-3 py-1.5 text-xs font-medium ' + (view === 'month' ? 'bg-accent text-white' : 'text-text-secondary hover:bg-gray-50')}
            >
              Month
            </button>
            <button
              onClick={() => setView('upcoming')}
              className={'px-3 py-1.5 text-xs font-medium border-l border-border ' + (view === 'upcoming' ? 'bg-accent text-white' : 'text-text-secondary hover:bg-gray-50')}
            >
              Upcoming
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="p-1.5 hover:bg-gray-100 rounded-md text-text-secondary">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-medium text-text-primary w-36 text-center">
              {format(currentDate, 'MMMM yyyy')}
            </span>
            <button onClick={nextMonth} className="p-1.5 hover:bg-gray-100 rounded-md text-text-secondary">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 flex justify-center"><Spinner /></div>
      ) : view === 'month' ? (
        <div className="border border-border rounded-md bg-surface overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-border">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-2 text-center text-xs font-medium text-text-muted uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>
          {/* Day cells */}
          <div className="grid grid-cols-7">
            {days.map((day, idx) => {
              const dayEvents = getEventsForDay(day);
              const inMonth = isSameMonth(day, currentDate);
              const today = isToday(day);

              return (
                <div
                  key={day.toISOString()}
                  className={
                    'min-h-[100px] p-1.5 border-b border-r border-border ' +
                    (!inMonth ? 'bg-gray-50/50 ' : '') +
                    (idx % 7 === 6 ? 'border-r-0 ' : '')
                  }
                >
                  <div className={'text-right text-xs mb-1 ' + (today ? 'font-bold text-accent' : 'text-text-muted')}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 3).map(e => (
                      <Link
                        key={e.id}
                        to={'/events/' + e.slug}
                        className="block px-1.5 py-0.5 text-xs truncate rounded bg-accent/10 text-accent font-medium hover:bg-accent/20 transition-colors"
                      >
                        {e.title}
                      </Link>
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="text-xs text-text-muted px-1.5">+{dayEvents.length - 3} more</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Upcoming view */
        <div>
          {!events || events.length === 0 ? (
            <EmptyState icon={CalendarIcon} title="No events this month" description="Try navigating to another month." />
          ) : (
            <div className="border-t border-border">
              {events
                .sort((a, b) => a.event_date.localeCompare(b.event_date))
                .map(event => (
                  <Link
                    key={event.id}
                    to={'/events/' + event.slug}
                    className="flex items-center justify-between py-4 border-b border-border hover:bg-gray-50/50 transition-colors group"
                  >
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-text-primary group-hover:text-accent truncate">
                        {event.title}
                      </h3>
                      <p className="text-xs text-text-muted mt-0.5">
                        {format(new Date(event.event_date + 'T00:00:00'), 'EEEE, MMM d')}
                        {event.start_time && ' · ' + event.start_time.slice(0, 5)}
                        {event.venue && ' · ' + event.venue}
                      </p>
                    </div>
                    {event.category && <Badge variant="default">{event.category}</Badge>}
                  </Link>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
