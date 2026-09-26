import React from 'react';
import { useParams } from 'react-router-dom';
import { useOrganization } from '../api/organizations';
import { Spinner } from '../components/common/Spinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { CheckCircle } from 'lucide-react';

export const OrgProfile = () => {
  const { slug } = useParams();
  const { data: org, isLoading, error } = useOrganization(slug);

  if (isLoading) return <Spinner />;
  if (error || !org) return <ErrorMessage message="Organization not found" />;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="flex items-center gap-6 pb-8 border-b border-border">
        <div className="w-24 h-24 bg-gray-200 rounded-md flex-shrink-0"></div>
        <div>
          <h1 className="text-3xl font-bold text-text-primary flex items-center gap-2">
            {org.name} {org.verified && <CheckCircle className="h-6 w-6 text-accent" />}
          </h1>
          <p className="text-text-secondary mt-2 max-w-2xl">{org.description}</p>
        </div>
      </header>
      
      <section>
        <h2 className="text-xl font-bold text-text-primary mb-6">Events by {org.name}</h2>
        <div className="text-center py-12 text-text-secondary bg-surface border border-border rounded-md">
          <p>No upcoming events.</p>
        </div>
      </section>
    </div>
  );
};
