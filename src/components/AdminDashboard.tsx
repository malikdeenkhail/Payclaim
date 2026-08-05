import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Plus, ShieldAlert, CheckCircle2, Clock, XCircle, Search, RefreshCw, LogOut } from "lucide-react";
import type { PaymentClaim, ClaimStatus } from "../types";

export default function AdminDashboard() {
  const [claims, setClaims] = useState<PaymentClaim[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New Claim Form
  const [showNewForm, setShowNewForm] = useState(false);
  const [newAmount, setNewAmount] = useState("");
  const [newReason, setNewReason] = useState("");
  
  const [search, setSearch] = useState("");

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/claims");
      const data = await res.json();
      setClaims(data.claims);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const handleCreateClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/admin/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(newAmount),
          reason: newReason
        })
      });
      setNewAmount("");
      setNewReason("");
      setShowNewForm(false);
      fetchClaims();
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (id: string, status: ClaimStatus) => {
    try {
      await fetch(`/api/admin/claims/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      fetchClaims();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Unclaimed": return "bg-slate-100 text-slate-700 border-slate-200";
      case "Pending Verification": return "bg-amber-100 text-amber-800 border-amber-200";
      case "Approved": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Payment Processing": return "bg-purple-100 text-purple-800 border-purple-200";
      case "Paid": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Rejected": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const filteredClaims = claims.filter(c => 
    c.id.toLowerCase().includes(search.toLowerCase()) || 
    c.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    c.mobileNumber?.includes(search)
  ).reverse();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500 mt-1">Manage payment claims and verifications.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={() => setShowNewForm(!showNewForm)}
            className="flex-1 md:flex-none bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" /> New Claim
          </button>
          <button onClick={fetchClaims} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors">
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {showNewForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Create New Legitimate Claim</h2>
          <form onSubmit={handleCreateClaim} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-slate-700 mb-1">Amount (PKR)</label>
              <input type="number" required min="1" value={newAmount} onChange={e => setNewAmount(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. 5000" />
            </div>
            <div className="flex-2 w-full md:w-2/3">
              <label className="block text-sm font-medium text-slate-700 mb-1">Reason / Description</label>
              <input type="text" required value={newReason} onChange={e => setNewReason(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. Freelance Payment" />
            </div>
            <button type="submit" className="w-full md:w-auto bg-slate-900 text-white px-6 py-2 rounded-lg font-bold hover:bg-slate-800 transition-colors h-[42px]">
              Generate Claim ID
            </button>
          </form>
        </motion.div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by ID, Name, Phone..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
            />
          </div>
          <div className="text-xs font-mono text-slate-500 hidden sm:block">
            {filteredClaims.length} records found
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Claim ID</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Beneficiary</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClaims.map(claim => (
                <tr key={claim.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono font-medium text-slate-900">{claim.id}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">Rs. {claim.amount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    {claim.fullName ? (
                      <div>
                        <div className="font-medium text-slate-900">{claim.fullName}</div>
                        <div className="text-slate-500 text-xs mt-0.5">{claim.paymentMethod} • {claim.mobileNumber}</div>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Not claimed yet</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(claim.status)}`}>
                      {claim.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(claim.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <select 
                      className="text-xs bg-slate-50 border border-slate-200 rounded-md px-2 py-1.5 outline-none focus:ring-2 focus:ring-emerald-500"
                      value={claim.status}
                      onChange={(e) => updateStatus(claim.id, e.target.value as ClaimStatus)}
                    >
                      <option value="Unclaimed">Unclaimed</option>
                      <option value="Pending Verification">Pending Verification</option>
                      <option value="Approved">Approved</option>
                      <option value="Payment Processing">Processing</option>
                      <option value="Paid">Paid</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </td>
                </tr>
              ))}
              {filteredClaims.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No claims found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
