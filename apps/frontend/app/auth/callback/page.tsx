"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "../../../store/userStore";
import { normaliseOrgId } from "../../../lib/utils";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const finalize = async () => {
      await new Promise((r) => setTimeout(r, 250));

      try {
        await useUserStore.getState().fetchUser();
        const { user } = useUserStore.getState();

        if (!user) {
          router.replace("/");
          return;
        }

        // Always redirect to the organizations page to allow switching/selecting
        router.replace("/organization");
      } catch (err) {
        router.replace("/");
      }
    };

    finalize();
  }, [router]);

  return <div className="p-6 text-lg">Finishing login…</div>;
}
