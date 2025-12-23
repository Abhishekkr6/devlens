"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "../../store/userStore";

export default function DashboardPage() {
  const { activeOrgId, loading } = useUserStore() as {
    activeOrgId: string | null,
    loading: boolean
  };
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (activeOrgId) {
        router.replace(`/organization/${activeOrgId}`);
      } else {
        router.replace("/organization");
      }
    }
  }, [activeOrgId, loading, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50">
      <div className="text-sm text-slate-500 animate-pulse">Redirecting to organization...</div>
    </div>
  );
}
