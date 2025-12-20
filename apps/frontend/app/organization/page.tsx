'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';
import { Button } from '@/components/Ui/Button';
import { Card } from '@/components/Ui/Card';

const OrganizationSelectionPage = () => {
  const router = useRouter();
  const { user, setActiveOrganization } = useUserStore();
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setOrganizations(user.orgIds || []);
      setLoading(false);
    }
  }, [user]);

  const handleOrgSelection = (orgId) => {
    setActiveOrganization(orgId);
    router.push('/dashboard');
  };

  const createOrganization = () => {
    router.push('/organization/new');
  };

  useEffect(() => {
    if (!loading && organizations.length === 1) {
      handleOrgSelection(organizations[0].id);
    }
  }, [loading, organizations]);

  if (loading) {
    return <div className="flex flex-col items-center justify-center min-h-screen">Loading...</div>;
  }

  if (organizations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">No organizations found</h1>
        <p className="mb-4">You are not a member of any organization.</p>
        <Button onClick={createOrganization}>Create Organization</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Select an Organization</h1>
      <div className="space-y-4">
        {organizations.map((org) => (
          <Card
            key={org.id}
            className="p-4 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
            onClick={() => handleOrgSelection(org.id)}
          >
            {org.name}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default OrganizationSelectionPage;