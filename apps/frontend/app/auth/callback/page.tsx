"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "../../../store/userStore";
import { normaliseOrgId } from "../../../lib/utils";
import { motion } from "motion/react";
import { Loader2, ShieldCheck } from "lucide-react";

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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand/10 rounded-full blur-[100px] pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 flex flex-col items-center justify-center p-8 md:p-12 rounded-3xl bg-surface/50 backdrop-blur-2xl border border-white/10 shadow-2xl max-w-sm w-full mx-4"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-brand/10 to-purple-500/10 opacity-50 rounded-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="relative flex items-center justify-center mb-6">
            <div className="absolute inset-0 bg-brand/30 blur-xl rounded-full animate-pulse" />
            <div className="w-16 h-16 bg-surface border border-border rounded-2xl flex items-center justify-center shadow-xl relative z-10">
              <Loader2 className="w-8 h-8 text-brand animate-spin" />
            </div>
          </div>
          
          <h2 className="text-2xl font-extrabold tracking-tight text-white mb-2">Authenticating</h2>
          <p className="text-sm text-slate-400 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-success" /> Securing your session...
          </p>
        </div>
      </motion.div>
    </div>
  );
}
