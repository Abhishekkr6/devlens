'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/Ui/Button';
import { Card } from '@/components/Ui/Card';

const NewOrganizationPage = () => {
  const router = useRouter();
  const [orgName, setOrgName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateOrganization = async () => {
    if (!orgName) {
      setError('Organization name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/orgs', { name: orgName });
      router.push('/organization');
    } catch (err) {
      setError('Failed to create organization. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Card className="p-8 space-y-4">
        <h1 className="text-2xl font-bold">Create a New Organization</h1>
        <input
          type="text"
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
          placeholder="Organization Name"
          className="w-full px-4 py-2 border rounded-md"
        />
        {error && <p className="text-red-500">{error}</p>}
        <Button onClick={handleCreateOrganization} disabled={loading}>
          {loading ? 'Creating...' : 'Create Organization'}
        </Button>
      </Card>
    </div>
  );
};

export default NewOrganizationPage;
