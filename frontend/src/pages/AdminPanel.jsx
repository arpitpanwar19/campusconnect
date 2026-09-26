import React from 'react';
import { useAdminStats, usePendingOrgs, useVerifyOrg } from '../api/admin';
import { Spinner } from '../components/common/Spinner';
import { Button } from '../components/common/Button';

export const AdminPanel = () => {
  const { data: stats, isLoading: loadingStats } = useAdminStats();
  const { data: pendingOrgs, isLoading: loadingOrgs } = usePendingOrgs();
  const verifyMutation = useVerifyOrg();

  if (loadingStats || loadingOrgs) return <Spinner />;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-text-primary">Admin Panel</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="p-6 bg-surface border border-border rounded-md">
          <p className="text-sm font-medium text-text-secondary">Users</p>
          <p className="text-2xl font-bold text-text-primary mt-2">{stats?.users || 0}</p>
        </div>
        <div className="p-6 bg-surface border border-border rounded-md">
          <p className="text-sm font-medium text-text-secondary">Events</p>
          <p className="text-2xl font-bold text-text-primary mt-2">{stats?.events || 0}</p>
        </div>
        <div className="p-6 bg-surface border border-border rounded-md">
          <p className="text-sm font-medium text-text-secondary">Organizations</p>
          <p className="text-2xl font-bold text-text-primary mt-2">{stats?.organizations || 0}</p>
        </div>
        <div className="p-6 bg-surface border border-border rounded-md">
          <p className="text-sm font-medium text-text-secondary">Registrations</p>
          <p className="text-2xl font-bold text-text-primary mt-2">{stats?.registrations || 0}</p>
        </div>
      </div>
      
      <section className="pt-8 border-t border-border">
        <h2 className="text-xl font-bold text-text-primary mb-4">Pending Organizations</h2>
        {!pendingOrgs?.length ? (
          <p className="text-sm text-text-secondary">No pending organizations.</p>
        ) : (
          <div className="border border-border rounded-md overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-medium text-text-secondary">Name</th>
                  <th className="px-4 py-3 font-medium text-text-secondary">Type</th>
                  <th className="px-4 py-3 font-medium text-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-surface">
                {pendingOrgs.map(org => (
                  <tr key={org.id}>
                    <td className="px-4 py-3 text-text-primary font-medium">{org.name}</td>
                    <td className="px-4 py-3 text-text-secondary">{org.type}</td>
                    <td className="px-4 py-3">
                      <Button size="sm" onClick={() => verifyMutation.mutate({ id: org.id, status: 'approved' })}>Approve</Button>
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
