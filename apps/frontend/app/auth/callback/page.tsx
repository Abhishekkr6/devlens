"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../../lib/api";
import { useUserStore } from "../../../store/userStore";
import { normaliseOrgId } from "../../../lib/utils";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const finalize = async () => {
      await new Promise((r) => setTimeout(r, 250));

      try {
        await useUserStore.getState().fetchUser();
        const { user, activeOrgId, setActiveOrganization } =
          useUserStore.getState();

        if (!user) {
          router.replace("/");
          return;
        }

        const orgs = user.orgIds || [];

        if (orgs.length === 0) {
          router.replace("/organization/new");
        } else if (orgs.length === 1) {
          const orgId = normaliseOrgId(orgs[0]);
          if (orgId) {
            setActiveOrganization(orgId);
          }
          router.replace("/dashboard");
        } else {
          const orgIds = orgs.map(normaliseOrgId).filter(Boolean) as string[];
          if (!activeOrgId || !orgIds.includes(activeOrgId)) {
            if (orgIds.length > 0) {
              setActiveOrganization(orgIds[0]);
            }
          }
          router.replace("/organization");
        }
      } catch (err) {
        router.replace("/");
      }
    };

    finalize();
  }, []);

  return <div className="p-6 text-lg">Finishing login…</div>;
}
