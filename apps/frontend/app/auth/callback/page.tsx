"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../../lib/api";
import { useUserStore } from "../../../store/userStore";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const finalize = async () => {
      await new Promise((r) => setTimeout(r, 250));

      try {
        await useUserStore.getState().fetchUser();

        // ⭐️ THIS IS THE IMPORTANT PART ⭐️
        const user = useUserStore.getState().user;
        if (user?.defaultOrgId) {
          localStorage.setItem("orgId", user.defaultOrgId);
        }

        router.replace("/organization");
      } catch (err) {
        router.replace("/");
      }
    };

    finalize();
  }, []);

  return <div className="p-6 text-lg">Finishing login…</div>;
}
