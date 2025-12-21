'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore, Org } from '@/store/userStore';
import { Button } from '@/components/Ui/Button';
import { Card } from '@/components/Ui/Card';

const OrganizationSelectionPage = () => {
  const router = useRouter();
  const { user, setActiveOrganization } = useUserStore();
  
  // Remove unnecessary state derivation
  const organizations: Org[] = useMemo(() => {
    if (!user || !Array.isArray(user.orgIds)) return [];
    
    return user.orgIds.filter(
      (org): org is Org =>
        org &&
        typeof org.id === 'string' &&
        typeof org.name === 'string'
    );
  }, [user]);

  // Single auto-select effect
  useEffect(() => {
    if (organizations.length === 1) {
      setActiveOrganization(organizations[0].id);
      router.push('/dashboard');
    }
  }, [organizations]);

  const handleOrgSelection = (orgId: string) => {
    setActiveOrganization(orgId);
    router.push('/dashboard');
  };

  const createOrganization = () => {
    router.push('/organization/new');
  };

  // No loading state needed
  if (!user) {
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
