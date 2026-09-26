import React from 'react';
import { Link } from 'react-router-dom';
import { useOrganizations } from '../api/organizations';
import { useEvents } from '../api/events';
import { useAuthStore } from '../store/authStore';
import { Spinner } from '../components/common/Spinner';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Plus, CheckCircle, Calendar, Eye, Users, Edit } from 'lucide-react';
import { format } from 'date-fns';

export const OrgDashboard = () => {
  const { user } = useAuthStore();
  const { data: orgs, isLoading: orgsLoading } = useOrganizations();
  const { data: eventsData, isLoading: eventsLoading } = useEvents({ page_size: 50 });

  if (orgsLoading || eventsLoading) {
    return <div className="py-12 flex justify-center"><Spinner /></div>;
  }

  // For simplicity, show all orgs the user might manage
  // In production, filter by membership
  const myOrgs = orgs || [];
  const allEvents = eventsData?.items || [];

  // Split events
  const publishedEvents = allEvents.filter(e => e.status === 'published');
  const draftEvents = allEvents.filter(e => e.status === 'draft');

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Organizer Dashboard</h1>
          <p className="mt-1 text-sm text-text-secondary">Manage your events and organizations</p>
        </div>
        <Link to="/organizer/events/new">
          <Button variant="primary" size="sm">
            <Plus className="h-4 w-4 mr-1.5" /> New Event
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 border border-border rounded-md">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wide">Published</p>
          <p className="text-xl font-bold text-text-primary mt-1">{publishedEvents.length}</p>
        </div>
        <div className="p-4 border border-border rounded-md">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wide">Drafts</p>
          <p className="text-xl font-bold text-text-primary mt-1">{draftEvents.length}</p>
        </div>
        <div className="p-4 border border-border rounded-md">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wide">Organizations</p>
          <p className="text-xl font-bold text-text-primary mt-1">{myOrgs.length}</p>
        </div>
        <div className="p-4 border border-border rounded-md">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wide">Total Views</p>
          <p className="text-xl font-bold text-text-primary mt-1">
            {allEvents.reduce((sum, e) => sum + (e.views_count || 0), 0)}
          </p>
        </div>
      </div>

      {/* My Organizations */}
      {myOrgs.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-text-primary mb-3">My Organizations</h2>
          <div className="divide-y divide-border border-t border-border">
            {myOrgs.map(org => (
              <div key={org.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center text-xs font-bold text-text-muted">
                    {org.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{org.name}</p>
                    <p className="text-xs text-text-muted">{org.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {org.is_verified ? (
                    <span className="inline-flex items-center gap-1 text-xs text-success font-medium">
                      <CheckCircle className="h-3 w-3" /> Verified
                    </span>
                  ) : (
                    <Badge variant="warning">Pending</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Drafts */}
      {draftEvents.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-text-primary mb-3">Drafts</h2>
          <div className="border border-border rounded-md overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-border">
                <tr>
                  <th className="px-4 py-2.5 font-medium text-text-muted text-xs uppercase">Event</th>
                  <th className="px-4 py-2.5 font-medium text-text-muted text-xs uppercase">Date</th>
                  <th className="px-4 py-2.5 font-medium text-text-muted text-xs uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {draftEvents.map(event => (
                  <tr key={event.id}>
                    <td className="px-4 py-3 font-medium text-text-primary">{event.title}</td>
                    <td className="px-4 py-3 text-text-secondary text-xs">{event.event_date}</td>
                    <td className="px-4 py-3 text-right">
                      <Link to={'/organizer/events/' + event.id + '/edit'}>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-3 w-3 mr-1" /> Edit
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Published Events */}
      <section>
        <h2 className="text-lg font-semibold text-text-primary mb-3">Published Events</h2>
        {publishedEvents.length === 0 ? (
          <EmptyState
            title="No published events"
            description="Create and publish your first event."
          />
        ) : (
          <div className="border border-border rounded-md overflow-hidden overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-border">
                <tr>
                  <th className="px-4 py-2.5 font-medium text-text-muted text-xs uppercase">Event</th>
                  <th className="px-4 py-2.5 font-medium text-text-muted text-xs uppercase">Date</th>
                  <th className="px-4 py-2.5 font-medium text-text-muted text-xs uppercase">Category</th>
                  <th className="px-4 py-2.5 font-medium text-text-muted text-xs uppercase">Views</th>
                  <th className="px-4 py-2.5 font-medium text-text-muted text-xs uppercase">Capacity</th>
                  <th className="px-4 py-2.5 font-medium text-text-muted text-xs uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {publishedEvents.map(event => (
                  <tr key={event.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <Link to={'/events/' + event.slug} className="font-medium text-text-primary hover:text-accent">
                        {event.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-text-secondary text-xs">
                      {format(new Date(event.event_date + 'T00:00:00'), 'MMM d, yyyy')}
                    </td>
                    <td className="px-4 py-3"><Badge variant="default">{event.category}</Badge></td>
                    <td className="px-4 py-3 text-text-secondary">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" /> {event.views_count || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {event.capacity || '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link to={'/organizer/events/' + event.id + '/edit'}>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-3 w-3 mr-1" /> Edit
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
