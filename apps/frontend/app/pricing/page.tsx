"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "motion/react";
import Script from "next/script";
import { useUserStore } from "../../store/userStore";
import { api } from "../../lib/api";
import {
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Lock,
  CreditCard,
} from "lucide-react";

// Extend Window with Razorpay type
declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PricingPage() {
  const { user, fetchUser } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const checkIcon = (color: string) => (
    <svg
      className={`w-5 h-5 md:w-6 md:h-6 flex-shrink-0 ${color}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={3}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );

  const handleRazorpayPayment = useCallback(async () => {
    if (!user) {
      window.location.href = "/api/v1/auth/github/login";
      return;
    }

    if (!scriptLoaded || !window.Razorpay) {
      alert("Payment gateway is loading. Please try again in a moment.");
      return;
    }

    try {
      setLoading(true);

      // Step 1: Create order on backend
      const orderRes = await api.post("/payments/create-order");
      const { orderId, amount, currency, keyId } = orderRes.data.data;

      // Step 2: Open Razorpay checkout
      const options = {
        key: keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount,
        currency,
        name: "DevLens",
        description: "Pro Plan — Lifetime Access",
        image: "/logo.svg",
        order_id: orderId,
        prefill: {
          name: user.name || "",
          email: user.email || "",
        },
        theme: {
          color: "#6366f1",
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            // Step 3: Verify payment on backend
            await api.post("/payments/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            // Step 4: Refresh user so whole app sees plan = "pro"
            await fetchUser?.();
            setPaymentSuccess(true);
          } catch (err: any) {
            alert(
              err.response?.data?.error ||
                "Payment verification failed. Please contact support."
            );
          } finally {
            setLoading(false);
          }
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", (response: any) => {
        console.error("Razorpay payment failed:", response.error);
        alert(
          `Payment failed: ${response.error?.description || "Unknown error"}. Please try again.`
        );
        setLoading(false);
      });

      rzp.open();
    } catch (err: any) {
      console.error("Payment initiation error:", err);
      alert(
        err.response?.data?.error ||
          "Failed to initiate payment. Please try again."
      );
      setLoading(false);
    }
  }, [user, scriptLoaded, fetchUser]);

  // Auto-show success if user is already Pro when page loads
  useEffect(() => {
    if (user?.plan === "pro") {
      setPaymentSuccess(false); // handled by conditional render below
    }
  }, [user]);

  const isProUser = user?.plan === "pro";

  return (
    <>
      {/* Load Razorpay JS SDK */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setScriptLoaded(true)}
        strategy="lazyOnload"
      />

      <div className="min-h-screen bg-background pt-20 md:pt-24 text-text-primary relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-brand/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

        {/* Header */}
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
            Start for Free Today
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
            Start for free, upgrade when you need advanced AI analysis and
            unlimited repositories.
          </motion.p>
          <p className="mt-2 text-sm text-text-secondary/70">
            🛡️ 100% full refund within 3 days. No questions asked.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6 md:gap-10 items-start px-4 sm:px-6 lg:px-8">
          {/* Free Tier */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-surface/50 rounded-3xl md:rounded-[3rem] border border-border p-8 md:p-10 flex flex-col h-full"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary">
              Free Tier
            </h2>
            <p className="mt-3 text-text-secondary text-sm md:text-base mb-6">
              Perfect for side projects and evaluating the platform.
            </p>
            <div className="mb-8 font-bold text-5xl md:text-6xl text-text-primary">
              ₹0{" "}
              <span className="text-lg text-text-secondary font-medium">
                / lifetime
              </span>
            </div>
            <ul className="space-y-4 mb-8 flex-1 text-text-secondary text-sm md:text-base">
              <li className="flex items-center gap-3">
                {checkIcon("text-success")} 2 Repository Limit
              </li>
              <li className="flex items-center gap-3">
                {checkIcon("text-success")} Basic PR Analysis
              </li>
              <li className="flex items-center gap-3">
                {checkIcon("text-success")} Up to 10 teammates
              </li>
              <li className="flex items-center gap-3">
                {checkIcon("text-success")} 1 Month Data Retention
              </li>
            </ul>
            <button
              className="w-full py-4 px-4 rounded-2xl border border-border text-text-secondary font-semibold bg-background transition-colors text-sm md:text-base"
              disabled
            >
              {user?.plan === "free" ? "Your Current Plan" : "Your Default Plan"}
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

            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Pro Plan
            </h2>
            <p className="mt-3 text-slate-400 text-sm md:text-base mb-6">
              Everything you need to ship high-quality code at scale.
            </p>
            <div className="mb-8 font-bold text-5xl md:text-6xl text-white">
              ₹499{" "}
              <span className="text-lg text-slate-400 font-medium">
                / lifetime
              </span>
            </div>
            <ul className="space-y-4 mb-8 flex-1 text-slate-300 text-sm md:text-base">
              <li className="flex items-center gap-3">
                {checkIcon("text-brand")} Unlimited Repositories
              </li>
              <li className="flex items-center gap-3">
                {checkIcon("text-brand")} Advanced AI PR Analysis
              </li>
              <li className="flex items-center gap-3">
                {checkIcon("text-brand")} High-Risk Code Detection
              </li>
              <li className="flex items-center gap-3">
                {checkIcon("text-brand")} Priority Support
              </li>
            </ul>

            {/* ── Payment Section ── */}
            <div className="bg-surface/30 rounded-2xl p-5 md:p-6 border border-border/50">
              {isProUser || paymentSuccess ? (
                /* Already Pro */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center space-y-4 p-8 bg-brand/10 border border-brand/20 rounded-3xl text-center shadow-lg"
                >
                  <div className="w-16 h-16 bg-brand/20 rounded-full flex items-center justify-center mb-2 shadow-inner border border-brand/30">
                    <Sparkles className="w-8 h-8 text-brand" />
                  </div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    You are a PRO User 🎉
                  </h3>
                  <p className="text-slate-400 text-sm md:text-base mb-2">
                    Thank you for your purchase! You have full access to DevLens
                    advanced features and unlimited repositories.
                  </p>
                  <button
                    type="button"
                    onClick={() => (window.location.href = "/organization")}
                    className="mt-4 px-6 py-3 bg-gradient-to-r from-brand to-violet-600 text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-brand/25 active:scale-95"
                  >
                    Go to Dashboard
                  </button>
                </motion.div>
              ) : (
                /* Upgrade CTA */
                <div className="flex flex-col gap-5">
                  {/* What you get summary */}
                  <div className="space-y-3">
                    <p className="text-slate-300 text-sm font-semibold mb-3">
                      Instant upgrade — no waiting, no manual approval
                    </p>
                    <div className="flex items-center gap-3 text-slate-400 text-xs">
                      <Zap className="w-4 h-4 text-brand flex-shrink-0" />
                      <span>Access unlocked immediately after payment</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-400 text-xs">
                      <CreditCard className="w-4 h-4 text-brand flex-shrink-0" />
                      <span>
                        UPI, Cards, NetBanking, Wallets — all accepted
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-400 text-xs">
                      <Lock className="w-4 h-4 text-brand flex-shrink-0" />
                      <span>256-bit encrypted · Powered by Razorpay</span>
                    </div>
                  </div>

                  {/* Pay Button */}
                  <button
                    onClick={handleRazorpayPayment}
                    disabled={loading || !scriptLoaded}
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-brand to-violet-600 text-white font-bold text-base tracking-wide hover:opacity-90 active:scale-[0.98] transition-all shadow-2xl shadow-brand/30 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3 border border-brand/20"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Processing...
                      </span>
                    ) : !scriptLoaded ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Loading...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5" />
                        Upgrade to Pro — ₹499
                      </span>
                    )}
                  </button>

                  {/* Security Badges */}
                  <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 py-3 bg-surface/30 rounded-xl border border-border/30">
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-success" />
                      Secured by Razorpay
                    </span>
                    <span className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-brand" />
                      Instant Activation
                    </span>
                  </div>

                  {/* Login CTA for guests */}
                  {!user && (
                    <p className="text-center text-xs text-slate-500">
                      <a
                        href="/api/v1/auth/github/login"
                        className="text-brand hover:underline font-medium"
                      >
                        Login with GitHub
                      </a>{" "}
                      first to complete your purchase.
                    </p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        <div className="py-12 md:py-16" />
      </div>
    </>
  );
}
