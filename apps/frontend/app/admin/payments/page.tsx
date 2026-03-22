"use client";

import { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import { useUserStore } from "../../../store/userStore";
import { useRouter } from "next/navigation";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  AlertCircle,
  CreditCard,
  Check,
  X,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

interface PaymentRequest {
  _id: string;
  userId: { _id: string; name: string; email: string; plan?: string };
  amount: number;
  transactionId: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export default function AdminPaymentsPage() {
  const { user, loading: userLoading } = useUserStore();
  const router = useRouter();
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const fetchRequests = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      const res = await api.get("/payments/admin");
      setRequests(res.data.data);
    } catch (err: any) {
      console.error(err);
      if (err.response?.status !== 401 && err.response?.status !== 403) {
        toast.error("Failed to load requests");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (userLoading) return;
    
    if (!user || user.role !== "admin") {
      router.push("/");
    } else {
      fetchRequests();
    }
  }, [user, userLoading, router]);

  const handleApprove = async (id: string, userName: string) => {
    try {
      if (!confirm(`Approve Pro upgrade for ${userName || 'this user'}?`)) return;
      
      const toastId = toast.loading("Approving request...");
      await api.post(`/payments/admin/${id}/approve`);
      toast.success("Payment approved! User upgraded to Pro.", { id: toastId });
      
      fetchRequests(true);
    } catch (e) {
      toast.error("Failed to approve payment");
    }
  };

  const handleReject = async (id: string, userName: string) => {
    try {
      if (!confirm(`Reject transaction for ${userName || 'this user'}?`)) return;
      
      const toastId = toast.loading("Rejecting request...");
      await api.post(`/payments/admin/${id}/reject`);
      toast.success("Payment request rejected.", { id: toastId });
      
      fetchRequests(true);
    } catch (e) {
      toast.error("Failed to reject payment");
    }
  };

  if (loading || userLoading) {
    return (
      <div className="min-h-screen bg-background pt-20 px-4 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand/30 border-t-brand rounded-full animate-spin mb-4" />
        <p className="text-text-secondary animate-pulse">Loading secure panel...</p>
      </div>
    );
  }

  const filteredRequests = requests.filter(req => {
    if (filterStatus !== "all" && req.status !== filterStatus) return false;
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchEmail = (req.userId?.email || "").toLowerCase().includes(query);
      const matchName = (req.userId?.name || "").toLowerCase().includes(query);
      const matchTxn = (req.transactionId || "").toLowerCase().includes(query);
      if (!matchEmail && !matchName && !matchTxn) return false;
    }
    return true;
  });

  // Calculate stats
  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === "pending").length,
    approved: requests.filter(r => r.status === "approved").length,
    rejected: requests.filter(r => r.status === "rejected").length,
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-brand/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-semibold mb-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
              </span>
              Admin Only
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">Payment Verification</h1>
            <p className="text-slate-400">Review and manage manual UPI payment requests for Pro upgrades.</p>
          </div>
          
          <button 
            onClick={() => fetchRequests(true)}
            className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg text-sm text-slate-300 hover:text-white hover:border-brand/50 transition-colors w-fit"
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-brand" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh Data"}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-surface/40 border border-border/50 rounded-2xl p-5 flex flex-col items-center justify-center text-center">
            <CreditCard className="w-6 h-6 text-slate-400 mb-2" />
            <span className="text-3xl font-bold text-white mb-1">{stats.total}</span>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Requests</span>
          </div>
          <div className="bg-warning/10 border border-warning/20 rounded-2xl p-5 flex flex-col items-center justify-center text-center">
            <Clock className="w-6 h-6 text-warning mb-2" />
            <span className="text-3xl font-bold text-warning mb-1">{stats.pending}</span>
            <span className="text-xs text-warning/80 uppercase tracking-wider font-semibold">Pending</span>
          </div>
          <div className="bg-success/10 border border-success/20 rounded-2xl p-5 flex flex-col items-center justify-center text-center">
            <CheckCircle2 className="w-6 h-6 text-success mb-2" />
            <span className="text-3xl font-bold text-success mb-1">{stats.approved}</span>
            <span className="text-xs text-success/80 uppercase tracking-wider font-semibold">Approved</span>
          </div>
          <div className="bg-error/10 border border-error/20 rounded-2xl p-5 flex flex-col items-center justify-center text-center">
            <XCircle className="w-6 h-6 text-error mb-2" />
            <span className="text-3xl font-bold text-error mb-1">{stats.rejected}</span>
            <span className="text-xs text-error/80 uppercase tracking-wider font-semibold">Rejected</span>
          </div>
        </div>
        
        {/* Filters and Search Bar */}
        <div className="bg-surface/50 border border-border backdrop-blur-xl rounded-2xl p-4 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by Name, Email or Txn ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/50 transition-all placeholder:text-slate-500"
            />
          </div>
          <div className="relative min-w-[160px]">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand/50 appearance-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="pending">🟡 Pending</option>
              <option value="approved">🟢 Approved</option>
              <option value="rejected">🔴 Rejected</option>
            </select>
          </div>
        </div>

        {/* Requests Table / List */}
        <div className="bg-surface/40 border border-border rounded-2xl overflow-hidden shadow-2xl">
          {filteredRequests.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-surface border border-border rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No requests found</h3>
              <p className="text-slate-400 max-w-sm">No manual payment requests match your current search and filter criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface border-b border-border text-xs uppercase tracking-wider text-slate-400 font-semibold">
                    <th className="px-6 py-4">Date & Time</th>
                    <th className="px-6 py-4">User Details</th>
                    <th className="px-6 py-4">Transaction ID</th>
                    <th className="px-6 py-4">Current Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <AnimatePresence>
                    {filteredRequests.map((req) => (
                      <motion.tr 
                        key={req._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-surface/30 transition-colors group"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-300">
                            {new Date(req.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            {new Date(req.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand to-brand/40 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                              {(req.userId?.name || "U")[0].toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-white">{req.userId?.name || "Unknown User"}</div>
                              <div className="text-xs text-slate-400">{req.userId?.email || "No email"}</div>
                              {req.userId?.plan === "pro" && (
                                <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-brand/20 text-brand outline outline-1 outline-brand/30">
                                  PRO USER
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="px-3 py-1.5 bg-black/40 border border-slate-700/50 rounded-lg inline-flex items-center gap-2">
                            <code className="text-sm font-mono text-brand font-bold tracking-wider">
                              {req.transactionId}
                            </code>
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(req.transactionId);
                                toast.success("Transaction ID copied");
                              }}
                              className="text-slate-500 hover:text-white transition-colors"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          {req.status === 'pending' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-warning/10 text-warning text-xs font-semibold border border-warning/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse"></span>
                               Pending
                            </span>
                          )}
                          {req.status === 'approved' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 text-success text-xs font-semibold border border-success/20">
                              <CheckCircle2 className="w-3 h-3" /> Approved
                            </span>
                          )}
                          {req.status === 'rejected' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-error/10 text-error text-xs font-semibold border border-error/20">
                              <XCircle className="w-3 h-3" /> Rejected
                            </span>
                          )}
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          {req.status === 'pending' ? (
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => handleApprove(req._id, req.userId?.name)} 
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-success/10 hover:bg-success text-success hover:text-white border border-success/20 hover:border-success rounded-lg transition-all text-xs font-bold"
                              >
                                <Check className="w-3.5 h-3.5" /> Approve
                              </button>
                              <button 
                                onClick={() => handleReject(req._id, req.userId?.name)} 
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-surface hover:bg-error text-slate-300 hover:text-white border border-border hover:border-error rounded-lg transition-all text-xs font-bold"
                              >
                                <X className="w-3.5 h-3.5" /> Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500 italic opacity-0 group-hover:opacity-100 transition-opacity">
                              Processed
                            </span>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
