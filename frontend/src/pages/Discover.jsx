import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEvents } from '../api/events';
import { useOrganizations } from '../api/organizations';
import { useNaturalSearch } from '../api/ai';
import { Spinner } from '../components/common/Spinner';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import { Select } from '../components/common/Select';
import { Search, MapPin, Clock, Calendar, CheckCircle, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

const CATEGORIES = [
  { value: '', label: 'All categories' },
  { value: 'technical', label: 'Technical' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'sports', label: 'Sports' },
  { value: 'competition', label: 'Competition' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'seminar', label: 'Seminar' },
  { value: 'hackathon', label: 'Hackathon' },
  { value: 'placement', label: 'Placement/Career' },
  { value: 'club', label: 'Club Activity' },
  { value: 'department', label: 'Department Event' },
  { value: 'other', label: 'Other' },
];

export const Discover = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialQuery = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [category, setCategory] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [orgId, setOrgId] = useState('');
  const [page, setPage] = useState(1);
  const [nlResult, setNlResult] = useState(null);
  const [isNlSearch, setIsNlSearch] = useState(false);

  const naturalSearch = useNaturalSearch();

  const filters = useMemo(() => ({
    page,
    page_size: 20,
    category: category || undefined,
    search: !isNlSearch && searchQuery ? searchQuery : undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
    org_id: orgId || undefined,
  }), [page, category, searchQuery, dateFrom, dateTo, orgId, isNlSearch]);

  const { data, isLoading, error } = useEvents(filters);
  const { data: orgs } = useOrganizations();

  const events = data?.items || [];
  const totalPages = data?.total_pages || 0;

  const handleSearch = async (e) => {
    e.preventDefault();
    setPage(1);

    // Try NL search if query looks like natural language
    if (searchQuery.length > 15 && searchQuery.includes(' ')) {
      try {
        const result = await naturalSearch.mutateAsync({ query: searchQuery });
        if (result && result.items) {
          setNlResult(result);
          setIsNlSearch(true);
          return;
        }
      } catch {
        // Fallback to standard search
      }
    }
    setIsNlSearch(false);
    setNlResult(null);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setCategory('');
    setDateFrom('');
    setDateTo('');
    setOrgId('');
    setPage(1);
    setNlResult(null);
    setIsNlSearch(false);
  };

  const displayEvents = isNlSearch && nlResult ? nlResult.items : events;

  const orgOptions = orgs
    ? [{ value: '', label: 'All organizations' }, ...orgs.map((o) => ({ value: o.id, label: o.name }))]
    : [{ value: '', label: 'All organizations' }];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Discover events</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Find events happening on campus
        </p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setIsNlSearch(false); }}
          placeholder='Search events or try "AI workshops for beginners this week"'
          className="w-full pl-10 pr-4 py-3 text-sm border border-border rounded-md bg-surface placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
        />
        {naturalSearch.isPending && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Spinner size="sm" />
          </div>
        )}
      </form>

      {isNlSearch && (
        <div className="flex items-center gap-2 text-xs text-accent">
          <Sparkles className="h-3 w-3" />
          <span>Showing AI-powered search results</span>
          <button onClick={clearFilters} className="underline">Clear</button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="w-44">
          <Select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            options={CATEGORIES}
          />
        </div>
        <div className="w-44">
          <Select
            value={orgId}
            onChange={(e) => { setOrgId(e.target.value); setPage(1); }}
            options={orgOptions}
          />
        </div>
        <div>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
            className="px-3 py-2 text-sm border border-border rounded-md bg-surface focus:outline-none focus:ring-1 focus:ring-accent"
            placeholder="From"
          />
        </div>
        <div>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
            className="px-3 py-2 text-sm border border-border rounded-md bg-surface focus:outline-none focus:ring-1 focus:ring-accent"
            placeholder="To"
          />
        </div>
        {(category || dateFrom || dateTo || orgId || searchQuery) && (
          <button onClick={clearFilters} className="text-xs text-accent hover:text-accent-hover underline self-center">
            Clear filters
          </button>
        )}
      </div>

      {/* Results */}
      {isLoading && !isNlSearch ? (
        <div className="py-12 flex justify-center"><Spinner /></div>
      ) : error ? (
        <div className="py-12 text-center text-sm text-error">
          Failed to load events. Please try again.
        </div>
      ) : displayEvents.length === 0 ? (
        <EmptyState
          title="No events found"
          description="Try adjusting your filters or search query."
        />
      ) : (
        <>
          <div className="border-t border-border">
            {displayEvents.map((event) => {
              const eventDate = new Date(event.event_date + 'T00:00:00');
              return (
                <button
                  key={event.id}
                  onClick={() => navigate(`/events/${event.slug}`)}
                  className="w-full text-left py-4 border-b border-border hover:bg-gray-50/50 transition-colors flex items-start justify-between gap-4 group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors truncate">
                        {event.title}
                      </h3>
                      {event.category && <Badge variant="default">{event.category}</Badge>}
                      {event.is_free === false && <Badge variant="warning">Paid</Badge>}
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
                  </div>
                  <div className="shrink-0">
                    <Badge variant={event.status === 'published' ? 'success' : 'default'}>
                      {event.status}
                    </Badge>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Pagination */}
          {!isNlSearch && totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 text-text-secondary hover:text-text-primary disabled:text-text-muted disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm text-text-secondary">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 text-text-secondary hover:text-text-primary disabled:text-text-muted disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
