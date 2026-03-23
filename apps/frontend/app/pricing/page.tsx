"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useUserStore } from "../../store/userStore";
import { api } from "../../lib/api";
import { Sparkles, CheckCircle2, Github, Zap, ShieldCheck, Clock } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export default function PricingPage() {
  const { user } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [hasPaid, setHasPaid] = useState(false);
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
    if (!transactionId.trim()) { alert("Please enter your UTR / Transaction ID."); return; }
    if (transactionId.trim().length < 10) { alert("Please enter a valid UTR (minimum 10 characters)."); return; }
    if (!hasPaid) { alert("Please confirm that you have made the payment."); return; }
    try {
      setLoading(true);
      await api.post("/payments/request", { transactionId: transactionId.trim() });
      setPaymentStatus("pending");
      setTransactionId("");
      setHasPaid(false);
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
            ₹1 <span className="text-lg text-slate-400 font-medium">/ lifetime</span>
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
              <div className="text-center py-4">
                <div className="text-success font-bold text-lg mb-4">🎉 You are on the Pro Plan!</div>
                <button
                  onClick={() => window.location.href = "/api/v1/auth/github/login"}
                  className="w-full py-3.5 px-4 rounded-xl bg-white text-slate-900 font-bold hover:bg-slate-200 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 text-sm md:text-base"
                >
                  <Github className="w-5 h-5" /> Login with GitHub
                </button>
              </div>
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
              <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full mt-2">
                {/* Vertically Stacked Premium Layout */}
                
                {/* QR Code (Top) */}
                <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-b from-brand/10 to-transparent rounded-3xl border border-brand/20 shadow-inner group">
                  <div className="bg-white p-3 rounded-2xl shadow-xl shadow-brand/20 relative z-10 transition-transform duration-500 group-hover:scale-105">
                    <QRCodeSVG
                      value={`upi://pay?pa=8092710774@airtel&pn=DevLens&am=1&cu=INR`}
                      size={160}
                      level={"H"}
                      includeMargin={false}
                    />
                  </div>
                </div>

                {/* Instructions & Steps (Bottom) */}
                <div className="flex flex-col justify-center space-y-5 bg-surface/30 p-5 md:p-6 rounded-3xl border border-border/30">
                  <h4 className="text-white text-lg font-bold flex items-center gap-2 pb-3 border-b border-border/50">
                    <Sparkles className="w-5 h-5 text-brand" /> Complete Upgrade
                  </h4>
                  
                  <div className="space-y-5">
                    <div className="flex gap-4 items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-brand/10 rounded-full flex items-center justify-center text-brand font-bold border border-brand/20 shadow-sm shadow-brand/10">1</div>
                      <p className="text-slate-300 text-sm leading-relaxed mt-1">
                        Scan the QR code with any UPI app and pay <strong className="text-white bg-brand/20 px-2 py-0.5 rounded text-sm whitespace-nowrap">Exactly ₹1</strong>
                      </p>
                    </div>
                    
                    <div className="flex gap-4 items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-brand/10 rounded-full flex items-center justify-center text-brand font-bold border border-brand/20 shadow-sm shadow-brand/10">2</div>
                      <p className="text-slate-300 text-sm leading-relaxed mt-1 break-words">
                        (Optional) Add email <strong className="text-white bg-surface px-1.5 py-0.5 rounded text-sm">{user?.email || "your email"}</strong> in the payment note.
                      </p>
                    </div>

                    <div className="pt-3 border-t border-border/50 space-y-4">
                      {/* UTR / Transaction ID Input */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">
                          UTR / Transaction ID <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          placeholder="Enter 12-digit UTR (e.g. 401234567890)"
                          className="w-full bg-surface border border-border/60 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-brand/70 focus:ring-1 focus:ring-brand/70 transition-all text-sm font-mono shadow-inner block"
                        />
                        <p className="text-xs text-slate-500 mt-1.5">Find this in your UPI app under payment history after paying.</p>
                      </div>

                      {/* I Have Paid Checkbox */}
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center mt-0.5">
                          <input 
                            type="checkbox" 
                            className="sr-only" 
                            checked={hasPaid}
                            onChange={(e) => setHasPaid(e.target.checked)}
                          />
                          <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${hasPaid ? 'bg-brand border-brand' : 'bg-surface border-border/60 group-hover:border-brand/50'}`}>
                            {hasPaid && <CheckCircle2 className="w-4 h-4 text-white" />}
                          </div>
                        </div>
                        <span className="text-sm font-medium text-slate-200 leading-snug">
                          I confirm I have successfully paid <strong className="text-white">₹1</strong> and the UTR above is correct.
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Security Badges */}
                <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 py-3 mt-2 bg-surface/30 rounded-xl border border-border/30">
                  <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-success" /> Secure Manual Verification</span>
                  <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-brand" /> 5-10 Min Avg. Approval</span>
                </div>

                <button
                  type="submit"
                  disabled={loading || !hasPaid || !transactionId.trim()}
                  className="w-full mt-2 py-4 px-6 rounded-2xl bg-gradient-to-r from-brand to-violet-600 text-white font-bold text-base tracking-wide hover:opacity-90 active:scale-[0.98] transition-all shadow-2xl shadow-brand/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3 border border-brand/20"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Submitting...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      Submit Payment Request
                    </span>
                  )}
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
