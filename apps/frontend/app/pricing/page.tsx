"use client";

import { useEffect, useState } from "react";
import { useUserStore } from "../../store/userStore";
import { api } from "../../lib/api";
import { useRouter } from "next/navigation";

export default function PricingPage() {
  const { user, fetchUser } = useUserStore();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<"none" | "pending" | "approved" | "rejected">("none");
  const [paymentRecord, setPaymentRecord] = useState<any>(null);

  // Fetch existing request status on load
  useEffect(() => {
    const checkStatus = async () => {
      if (!user) return;
      try {
        const res = await api.get("/payments/status");
        if (res.data?.data?.length > 0) {
          // Get the most recent one
          const latest = res.data.data[0];
          setPaymentStatus(latest.status);
          setPaymentRecord(latest);
        }
      } catch (e) {
        console.error("Failed to fetch payment status", e);
      }
    };
    checkStatus();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId.trim()) {
      alert("Please enter a valid Transaction ID");
      return;
    }

    try {
      setLoading(true);
      await api.post("/payments/request", { transactionId });
      setPaymentStatus("pending");
      setTransactionId("");
      alert("Payment request submitted successfully. We will verify it shortly.");
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to submit request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 text-indigo-400 text-sm font-semibold mb-6 border border-indigo-500/20">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
          </span>
          Includes 7-Day Free Trial
        </div>
        <h1 className="text-4xl font-extrabold text-text-primary sm:text-5xl tracking-tight">
          Choose the right plan for your team
        </h1>
        <p className="mt-4 text-xl text-text-secondary">
          Unlock advanced AI PR analysis and connect unlimited repositories.
        </p>
        <p className="mt-2 text-sm text-text-secondary font-medium">
          🛡️ 100% full refund within 3 days. No questions asked.
        </p>
      </div>

      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 items-start">
        {/* Free Variant */}
        <div className="bg-surface rounded-3xl shadow-sm border border-border p-8 flex flex-col h-full opacity-90 hover:opacity-100 transition-opacity">
          <h2 className="text-2xl font-bold text-text-primary">Free Tier</h2>
          <p className="mt-4 text-text-secondary line-clamp-2">Perfect for side projects and evaluating the platform's utility.</p>
          <div className="my-8">
            <span className="text-5xl font-extrabold text-text-primary">₹0</span>
            <span className="text-text-secondary font-medium ml-2">/month</span>
          </div>

          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center text-slate-300">
              <span className="mr-3 text-green-500 text-lg">✓</span> 1 Repository Limit
            </li>
            <li className="flex items-center text-slate-300">
              <span className="mr-3 text-green-500 text-lg">✓</span> Basic PR Analysis
            </li>
            <li className="flex items-center text-slate-500">
              <span className="mr-3 text-slate-600 text-lg">✗</span> No High-Risk Alerts
            </li>
          </ul>

          <button className="w-full py-4 px-4 rounded-xl border border-border text-text-secondary font-semibold hover:border-slate-500 transition-colors bg-background" disabled>
            {user?.plan === 'free' ? 'Your Current Plan' : 'Included in Trial'}
          </button>
        </div>

        {/* Pro Variant with UPI */}
        <div className="bg-slate-900 rounded-3xl shadow-2xl p-8 flex flex-col relative overflow-hidden transform md:-translate-y-4 border border-indigo-500/50 h-full">
          <div className="absolute top-0 right-0 bg-blue-600 text-xs font-bold px-4 py-1.5 rounded-bl-xl text-white uppercase tracking-wider shadow-sm">
            Recommended
          </div>
          
          <h2 className="text-2xl font-bold text-white">Pro</h2>
          <p className="mt-4 text-gray-400 line-clamp-2">Everything you need to ship high-quality code and scale.</p>
          <div className="my-8">
            <span className="text-5xl font-extrabold text-white">₹499</span>
            <span className="text-gray-400 font-medium ml-2">/month</span>
          </div>

          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center text-gray-300">
              <span className="mr-3 text-blue-500 text-lg">✓</span> Unlimited Repositories
            </li>
            <li className="flex items-center text-gray-300">
              <span className="mr-3 text-blue-500 text-lg">✓</span> Advanced AI PR Analysis
            </li>
            <li className="flex items-center text-gray-300">
              <span className="mr-3 text-blue-500 text-lg">✓</span> Priority Support
            </li>
          </ul>

          {/* Payment Section */}
          <div className="bg-gray-800 rounded-xl p-6 mt-4 border border-gray-700">
            {!user ? (
               <div className="text-center py-6">
                 <p className="text-gray-300 font-medium mb-5">You need to create an account to start your trial.</p>
                 <button onClick={() => window.location.href = '/api/v1/auth/github/login'} className="w-full py-4 px-4 rounded-xl bg-white text-slate-900 font-bold hover:bg-slate-200 transition-transform hover:-translate-y-1 shadow-lg flex items-center justify-center gap-3">
                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                   Login with GitHub
                 </button>
               </div>
            ) : user?.plan === 'pro' && paymentStatus !== "pending" ? (
              <div className="text-center text-green-400 font-semibold py-4">
                🎉 You are currently enjoying the Pro Plan!
              </div>
            ) : paymentStatus === "pending" ? (
              <div className="text-center bg-yellow-900/30 rounded-lg p-6 border border-yellow-700/50">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-500/30">
                  <svg className="w-6 h-6 text-yellow-400 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <p className="text-yellow-400 font-bold text-lg">Verification Pending</p>
                <p className="text-sm text-yellow-200/80 mt-2 mb-4">We are securely reviewing your transaction manually to prevent fraud. Access will be unlocked shortly.</p>
                <div className="bg-black/20 rounded p-3 text-left text-xs text-gray-300 font-mono space-y-1">
                  <p>Transaction ID: <span className="text-white">{paymentRecord?.transactionId}</span></p>
                  <p>Submitted: <span className="text-white">{paymentRecord?.createdAt ? new Date(paymentRecord.createdAt).toLocaleString() : 'Just now'}</span></p>
                </div>
                <p className="text-xs text-gray-400 mt-4">
                  Need help? Contact <a href="mailto:support@devlens.com" className="text-blue-400 hover:underline">support@devlens.com</a>
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col space-y-5">
                
                {/* Step-by-step instructions */}
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50 mb-2">
                  <h4 className="text-white text-sm font-bold mb-3 border-b border-gray-700 pb-2">Complete your upgrade in 3 steps:</h4>
                  <ul className="text-sm text-gray-300 space-y-3">
                    <li className="flex items-start">
                      <span className="flex-shrink-0 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-xs text-white font-bold mr-3">1</span>
                      <p>Scan the QR below or copy the UPI ID and pay <strong className="text-white">Exactly ₹499</strong>.</p>
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-xs text-white font-bold mr-3">2</span>
                      <p>Add <strong className="text-white bg-gray-800 px-1 rounded">{user?.email || 'your account email'}</strong> in the payment note.</p>
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-xs text-white font-bold mr-3">3</span>
                      <p>Enter the 12-digit UTR/Transaction ID below and click Submit.</p>
                    </li>
                  </ul>
                </div>

                <div className="text-center bg-gray-900 rounded-lg p-5 border border-gray-700 shadow-inner">
                  
                  <div className="bg-white p-2 rounded-lg inline-block text-black font-semibold mx-auto w-32 h-32 flex items-center justify-center mb-3">
                    {/* Placeholder for real QR code image */}
                    <div className="w-full h-full border-2 border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-400 text-center">
                      QR Image
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center space-x-2 bg-gray-800 rounded px-3 py-2 border border-gray-600">
                    <p className="text-sm font-mono text-gray-300">pay@devlens</p>
                    <button 
                      type="button"
                      onClick={() => {
                        window.navigator.clipboard.writeText("pay@devlens");
                        alert("UPI ID Copied!");
                      }}
                      className="text-blue-400 hover:text-blue-300 text-sm ml-2 font-medium"
                    >
                      Copy
                    </button>
                  </div>
                  
                  <div className="mt-5 text-left text-xs text-gray-400 bg-black/20 p-3 rounded-md border border-gray-800">
                    <p className="flex items-center gap-2 mb-1"><span className="text-green-400">🛡️</span> Secure Manual Verification to prevent fraud.</p>
                    <p className="flex items-center gap-2 mb-1"><span className="text-blue-400">⏱️</span> Approvals typically take 5–30 minutes.</p>
                    <p className="flex items-center gap-2"><span className="text-orange-400">💬</span> <a href="mailto:support@devlens.com" className="hover:text-white transition-colors cursor-pointer">Support responds within 24 hours.</a></p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">12-Digit UPI Transaction ID / UTR</label>
                  <input
                    type="text"
                    required
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="e.g. 301234567890"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={loading || !transactionId}
                  className="w-full py-3 px-4 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {loading ? 'Submitting...' : 'Submit Transaction'}
                </button>
              </form>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
