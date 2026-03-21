"use client";

import { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import { useUserStore } from "../../../store/userStore";
import { useRouter } from "next/navigation";

interface PaymentRequest {
  _id: string;
  userId: { _id: string; name: string; email: string; plan?: string };
  amount: number;
  transactionId: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export default function AdminPaymentsPage() {
  const { user } = useUserStore();
  const router = useRouter();
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const fetchRequests = async () => {
    try {
      const res = await api.get("/payments/admin");
      setRequests(res.data.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load requests. Are you an Admin?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role !== "admin") {
      router.push("/dashboard");
    } else if (user) {
      fetchRequests();
    }
  }, [user, router]);

  const handleApprove = async (id: string) => {
    try {
      if (!confirm("Approve this transaction? User will be upgraded to Pro.")) return;
      await api.post(`/payments/admin/${id}/approve`);
      fetchRequests();
    } catch (e) {
      alert("Failed to approve");
    }
  };

  const handleReject = async (id: string) => {
    try {
      if (!confirm("Reject this transaction?")) return;
      await api.post(`/payments/admin/${id}/reject`);
      fetchRequests();
    } catch (e) {
      alert("Failed to reject");
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  const filteredRequests = requests.filter(req => {
    if (filterStatus !== "all" && req.status !== filterStatus) return false;
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchEmail = (req.userId?.email || "").toLowerCase().includes(query);
      const matchTxn = (req.transactionId || "").toLowerCase().includes(query);
      if (!matchEmail && !matchTxn) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Payment Verification</h1>
        
        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="w-full sm:w-1/3">
            <input 
              type="text" 
              placeholder="Search by Email or Transaction ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm placeholder-gray-400"
            />
          </div>
          <div className="w-full sm:w-auto flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-500">Filter Status:</span>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 text-sm">No payment requests found matching the criteria.</td>
                </tr>
              )}
              {filteredRequests.map((req) => (
                <tr key={req._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{req.userId?.name || "Unknown"}</div>
                    <div className="text-sm text-gray-500">{req.userId?.email}</div>
                    <div className="text-xs text-blue-500">{req.userId?.plan}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                    {req.transactionId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        req.status === 'approved' ? 'bg-green-100 text-green-800' : 
                        'bg-red-100 text-red-800'}`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {req.status === 'pending' && (
                      <div className="flex justify-end space-x-2">
                        <button onClick={() => handleApprove(req._id)} className="text-green-600 hover:text-green-900 px-3 py-1 bg-green-50 rounded-md">Approve</button>
                        <button onClick={() => handleReject(req._id)} className="text-red-600 hover:text-red-900 px-3 py-1 bg-red-50 rounded-md">Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
