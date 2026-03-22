"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useUserStore } from "../../store/userStore";
import { api } from "../../lib/api";
import { Sparkles, CheckCircle2, Github, Zap } from "lucide-react";

export default function PricingPage() {
  const { user } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<"none" | "pending" | "approved" | "rejected">("none");
  const [paymentRecord, setPaymentRecord] = useState<any>(null);

  useEffect(() => {
    const checkStatus = async () => {
      if (!user) return;
      try {
        const res = await api.get("/payments/status");
        if (res.data?.data?.length > 0) {
          const latest = res.data.data[0];
          setPaymentStatus(latest.status);
          setPaymentRecord(latest);
        }
      } catch (e) { console.error("Failed to fetch payment status", e); }
    };
    checkStatus();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId.trim()) { alert("Please enter a valid Transaction ID"); return; }
    try {
      setLoading(true);
      await api.post("/payments/request", { transactionId });
      setPaymentStatus("pending");
      setTransactionId("");
      alert("Payment request submitted successfully. We will verify it shortly.");
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to submit request.");
    } finally { setLoading(false); }
  };

  const checkIcon = (color: string) => (
    <svg className={`w-5 h-5 md:w-6 md:h-6 flex-shrink-0 ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-background pt-20 md:pt-24 text-text-primary relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-brand/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <div className="max-w-3xl mx-auto px-4 text-center mb-12 md:mb-16">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs md:text-sm font-semibold mb-6"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand"></span>
          </span>
          Includes 7-Day Free Trial
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4"
        >
          Simple, transparent pricing
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base md:text-xl text-text-secondary font-light"
        >
          Start for free, upgrade when you need advanced AI analysis and unlimited repositories.
        </motion.p>
        <p className="mt-2 text-sm text-text-secondary/70">🛡️ 100% full refund within 3 days. No questions asked.</p>
      </div>

      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6 md:gap-8 items-start px-4">
        {/* Free Tier */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-surface/50 rounded-3xl md:rounded-[3rem] border border-border p-8 md:p-10 flex flex-col h-full"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary">Free Tier</h2>
          <p className="mt-3 text-text-secondary text-sm md:text-base mb-6">Perfect for side projects and evaluating the platform.</p>
          <div className="mb-8 font-bold text-5xl md:text-6xl text-text-primary">
            ₹0 <span className="text-lg text-text-secondary font-medium">/ lifetime</span>
          </div>
          <ul className="space-y-4 mb-8 flex-1 text-text-secondary text-sm md:text-base">
            <li className="flex items-center gap-3">{checkIcon("text-success")} 2 Repository Limit</li>
            <li className="flex items-center gap-3">{checkIcon("text-success")} Basic PR Analysis</li>
            <li className="flex items-center gap-3">{checkIcon("text-success")} Up to 10 teammates</li>
            <li className="flex items-center gap-3 opacity-40">{checkIcon("text-border")} No High-Risk Alerts</li>
          </ul>
          <button
            className="w-full py-4 px-4 rounded-2xl border border-border text-text-secondary font-semibold bg-background transition-colors text-sm md:text-base"
            disabled
          >
            {user?.plan === "free" ? "Your Current Plan" : "Included in Trial"}
          </button>
        </motion.div>

        {/* Pro Tier */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative bg-[#0E1116] rounded-3xl md:rounded-[3rem] p-8 md:p-10 flex flex-col border border-brand/60 shadow-xl md:-translate-y-4 h-full"
        >
          <div className="absolute top-0 right-8 -translate-y-1/2">
            <span className="bg-brand text-white text-xs font-black px-4 py-1.5 uppercase tracking-widest rounded-full shadow-sm">
              Most Popular
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white">Pro Plan</h2>
          <p className="mt-3 text-slate-400 text-sm md:text-base mb-6">Everything you need to ship high-quality code at scale.</p>
          <div className="mb-8 font-bold text-5xl md:text-6xl text-white">
            ₹499 <span className="text-lg text-slate-400 font-medium">/ lifetime</span>
          </div>
          <ul className="space-y-4 mb-8 flex-1 text-slate-300 text-sm md:text-base">
            <li className="flex items-center gap-3">{checkIcon("text-brand")} Unlimited Repositories</li>
            <li className="flex items-center gap-3">{checkIcon("text-brand")} Advanced AI PR Analysis</li>
            <li className="flex items-center gap-3">{checkIcon("text-brand")} High-Risk Code Detection</li>
            <li className="flex items-center gap-3">{checkIcon("text-brand")} Priority Support</li>
          </ul>

          {/* Payment Section */}
          <div className="bg-surface/30 rounded-2xl p-5 md:p-6 border border-border/50">
            {!user ? (
              <div className="text-center py-4">
                <p className="text-slate-300 font-medium mb-5 text-sm">Create an account to start your free trial.</p>
                <button
                  onClick={() => window.location.href = "/api/v1/auth/github/login"}
                  className="w-full py-3.5 px-4 rounded-xl bg-white text-slate-900 font-bold hover:bg-slate-200 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 text-sm md:text-base"
                >
                  <Github className="w-5 h-5" /> Login with GitHub
                </button>
              </div>
            ) : user?.plan === "pro" && paymentStatus !== "pending" ? (
              <div className="text-center text-success font-semibold py-4">🎉 You are on the Pro Plan!</div>
            ) : paymentStatus === "pending" ? (
              <div className="text-center bg-warning/10 rounded-xl p-6 border border-warning/20">
                <div className="w-12 h-12 bg-warning/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-warning/30">
                  <svg className="w-6 h-6 text-warning animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <p className="text-warning font-bold text-lg">Verification Pending</p>
                <p className="text-sm text-warning/80 mt-2 mb-4">We are reviewing your transaction. Access will be unlocked shortly.</p>
                <div className="bg-black/20 rounded-lg p-3 text-left text-xs text-slate-300 font-mono space-y-1">
                  <p>Transaction ID: <span className="text-white">{paymentRecord?.transactionId}</span></p>
                  <p>Submitted: <span className="text-white">{paymentRecord?.createdAt ? new Date(paymentRecord.createdAt).toLocaleString() : "Just now"}</span></p>
                </div>
                <p className="text-xs text-slate-400 mt-4">
                  Need help? <a href="mailto:support@devlens.com" className="text-brand hover:underline">support@devlens.com</a>
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col space-y-5">
                {/* Instructions */}
                <div className="bg-background/50 rounded-xl p-4 border border-border/50">
                  <h4 className="text-text-primary text-sm font-bold mb-3 pb-2 border-b border-border/50">Complete upgrade in 3 steps:</h4>
                  <ul className="text-sm text-text-secondary space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-5 h-5 bg-brand rounded-full flex items-center justify-center text-xs text-white font-bold">1</span>
                      Scan QR or copy UPI ID and pay <strong className="text-text-primary">Exactly ₹499</strong>.
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-5 h-5 bg-brand rounded-full flex items-center justify-center text-xs text-white font-bold">2</span>
                      Add <strong className="text-text-primary">{user?.email || "your email"}</strong> in the payment note.
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-5 h-5 bg-brand rounded-full flex items-center justify-center text-xs text-white font-bold">3</span>
                      Enter the UTR/Transaction ID below and submit.
                    </li>
                  </ul>
                </div>

                {/* QR + UPI */}
                <div className="text-center bg-background/50 rounded-xl p-5 border border-border/50">
                  <div className="bg-white p-2 rounded-lg inline-block mb-3 w-28 h-28 flex items-center justify-center">
                    <div className="w-full h-full border-2 border-dashed border-slate-300 flex items-center justify-center text-xs text-slate-400 text-center rounded">QR Image</div>
                  </div>
                  <div className="flex items-center justify-center gap-2 bg-background rounded-lg px-3 py-2 border border-border">
                    <p className="text-sm font-mono text-text-secondary">pay@devlens</p>
                    <button type="button" onClick={() => { navigator.clipboard.writeText("pay@devlens"); alert("Copied!"); }} className="text-brand hover:text-brand/80 text-xs font-semibold ml-1">Copy</button>
                  </div>
                  <div className="mt-4 text-left text-xs text-text-secondary bg-background/50 p-3 rounded-lg border border-border/30 space-y-1">
                    <p className="flex items-center gap-2"><span className="text-success">🛡️</span> Secure manual verification.</p>
                    <p className="flex items-center gap-2"><span className="text-brand">⏱️</span> Approvals take 5–30 minutes.</p>
                    <p className="flex items-center gap-2"><span className="text-warning">💬</span> <a href="mailto:support@devlens.com" className="hover:text-text-primary transition-colors">Support within 24 hours.</a></p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">12-Digit UPI Transaction ID / UTR</label>
                  <input
                    type="text"
                    required
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="e.g. 301234567890"
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-primary placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-brand/50 text-sm md:text-base"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !transactionId}
                  className="w-full py-3.5 px-4 rounded-xl bg-brand text-white font-bold hover:bg-brand/90 active:scale-95 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                >
                  {loading ? "Submitting..." : "Submit Transaction"}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>

      <div className="py-12 md:py-16" />
    </div>
  );
}
