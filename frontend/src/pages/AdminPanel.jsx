import React, { useState } from 'react';
import { useAdminStats, usePendingOrgs, useVerifyOrg, useAdminEvents, useAdminUsers, useAuditLogs, useDisableEvent, useChangeUserRole } from '../api/admin';
import { Spinner } from '../components/common/Spinner';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { Select } from '../components/common/Select';
import { format } from 'date-fns';
import { Users, Calendar, Building2, BarChart3, Shield, FileText } from 'lucide-react';

const TABS = [
  { id: 'stats', label: 'Overview', icon: BarChart3 },
  { id: 'orgs', label: 'Organizations', icon: Building2 },
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'audit', label: 'Audit Logs', icon: FileText },
];

export const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('stats');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-text-muted" />
        <h1 className="text-2xl font-bold text-text-primary">Admin Panel</h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex -mb-px overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={
                'flex items-center gap-1.5 py-3 px-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ' +
                (activeTab === tab.id
                  ? 'border-accent text-accent'
                  : 'border-transparent text-text-secondary hover:text-text-primary')
              }
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'stats' && <StatsTab />}
      {activeTab === 'orgs' && <OrgsTab />}
      {activeTab === 'events' && <EventsTab />}
      {activeTab === 'users' && <UsersTab />}
      {activeTab === 'audit' && <AuditTab />}
    </div>
  );
};

const StatsTab = () => {
  const { data: stats, isLoading } = useAdminStats();

  if (isLoading) return <div className="py-8 flex justify-center"><Spinner /></div>;

  const items = [
    { label: 'Total Users', value: stats?.total_users || 0 },
    { label: 'Total Events', value: stats?.total_events || 0 },
    { label: 'Organizations', value: stats?.total_organizations || 0 },
    { label: 'Registrations', value: stats?.total_registrations || 0 },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map(item => (
        <div key={item.label} className="p-5 border border-border rounded-md">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wide">{item.label}</p>
          <p className="text-2xl font-bold text-text-primary mt-1">{item.value}</p>
        </div>
      ))}
    </div>
  );
};

const OrgsTab = () => {
  const { data: pendingOrgs, isLoading } = usePendingOrgs();
  const verifyMutation = useVerifyOrg();

  if (isLoading) return <div className="py-8 flex justify-center"><Spinner /></div>;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-text-primary">Pending Verification</h2>
      {!pendingOrgs?.length ? (
        <EmptyState title="No pending organizations" description="All organizations have been reviewed." />
      ) : (
        <div className="border border-border rounded-md overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-border">
              <tr>
                <th className="px-4 py-3 font-medium text-text-muted text-xs uppercase">Name</th>
                <th className="px-4 py-3 font-medium text-text-muted text-xs uppercase">Type</th>
                <th className="px-4 py-3 font-medium text-text-muted text-xs uppercase">Description</th>
                <th className="px-4 py-3 font-medium text-text-muted text-xs uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pendingOrgs.map(org => (
                <tr key={org.id}>
                  <td className="px-4 py-3 font-medium text-text-primary">{org.name}</td>
                  <td className="px-4 py-3 text-text-secondary">{org.type}</td>
                  <td className="px-4 py-3 text-text-secondary text-xs max-w-xs truncate">{org.description || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button size="sm" variant="primary" onClick={() => verifyMutation.mutate(org.id)} loading={verifyMutation.isPending}>
                        Approve
                      </Button>
                      <Button size="sm" variant="ghost" className="text-error">Reject</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const EventsTab = () => {
  const { data, isLoading } = useAdminEvents();
  const disableMutation = useDisableEvent();

  if (isLoading) return <div className="py-8 flex justify-center"><Spinner /></div>;

  const events = data?.items || [];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-text-primary">All Events</h2>
      {events.length === 0 ? (
        <EmptyState title="No events" description="No events have been created yet." />
      ) : (
        <div className="border border-border rounded-md overflow-hidden overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-border">
              <tr>
                <th className="px-4 py-3 font-medium text-text-muted text-xs uppercase">Title</th>
                <th className="px-4 py-3 font-medium text-text-muted text-xs uppercase">Date</th>
                <th className="px-4 py-3 font-medium text-text-muted text-xs uppercase">Category</th>
                <th className="px-4 py-3 font-medium text-text-muted text-xs uppercase">Status</th>
                <th className="px-4 py-3 font-medium text-text-muted text-xs uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {events.map(event => (
                <tr key={event.id}>
                  <td className="px-4 py-3 font-medium text-text-primary">{event.title}</td>
                  <td className="px-4 py-3 text-text-secondary text-xs">{event.event_date}</td>
                  <td className="px-4 py-3"><Badge variant="default">{event.category}</Badge></td>
                  <td className="px-4 py-3">
                    <Badge variant={event.status === 'published' ? 'success' : event.status === 'cancelled' ? 'error' : 'default'}>
                      {event.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {event.status === 'published' && (
                      <Button size="sm" variant="ghost" className="text-error" onClick={() => disableMutation.mutate(event.id)}>
                        Disable
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const UsersTab = () => {
  const { data, isLoading } = useAdminUsers();
  const changeRole = useChangeUserRole();

  if (isLoading) return <div className="py-8 flex justify-center"><Spinner /></div>;

  const users = data?.items || [];

  const handleRoleChange = (userId, newRole) => {
    changeRole.mutate({ userId, role: newRole });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-text-primary">Users</h2>
      {users.length === 0 ? (
        <EmptyState title="No users" description="No users registered yet." />
      ) : (
        <div className="border border-border rounded-md overflow-hidden overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-border">
              <tr>
                <th className="px-4 py-3 font-medium text-text-muted text-xs uppercase">Name</th>
                <th className="px-4 py-3 font-medium text-text-muted text-xs uppercase">Email</th>
                <th className="px-4 py-3 font-medium text-text-muted text-xs uppercase">Branch</th>
                <th className="px-4 py-3 font-medium text-text-muted text-xs uppercase">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map(user => (
                <tr key={user.id}>
                  <td className="px-4 py-3 font-medium text-text-primary">{user.full_name}</td>
                  <td className="px-4 py-3 text-text-secondary text-xs">{user.email}</td>
                  <td className="px-4 py-3 text-text-secondary">{user.branch || '—'}</td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="text-xs border border-border rounded px-2 py-1 bg-surface"
                    >
                      <option value="student">Student</option>
                      <option value="organizer">Organizer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const AuditTab = () => {
  const { data, isLoading } = useAuditLogs();

  if (isLoading) return <div className="py-8 flex justify-center"><Spinner /></div>;

  const logs = data?.items || [];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-text-primary">Audit Logs</h2>
      {logs.length === 0 ? (
        <EmptyState title="No audit logs" description="Actions will be logged here." />
      ) : (
        <div className="border-t border-border">
          {logs.map(log => (
            <div key={log.id} className="py-3 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-primary">
                    <span className="font-medium">{log.action}</span>
                    <span className="text-text-muted"> on </span>
                    <span className="font-medium">{log.target_type}</span>
                  </p>
                  {log.details && (
                    <p className="text-xs text-text-muted mt-0.5">
                      {typeof log.details === 'object' ? JSON.stringify(log.details) : log.details}
                    </p>
                  )}
                </div>
                <span className="text-xs text-text-muted flex-shrink-0">
                  {log.created_at ? format(new Date(log.created_at), 'MMM d, HH:mm') : ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
