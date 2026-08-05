import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Plus, ShieldAlert, CheckCircle2, Clock, XCircle, Search, RefreshCw, LogOut, Users, FileText, Download, Shield, UserX, UserCheck } from "lucide-react";
import type { PaymentClaim, ClaimStatus } from "../types";

// Mock Data for new tabs
const mockAuditLogs = [
  { id: 1, action: "Admin login successful", user: "admin@payclaim.pk", time: new Date().toISOString(), ip: "192.168.1.55" },
  { id: 2, action: "Claim Pay7 status updated to Approved", user: "admin@payclaim.pk", time: new Date(Date.now() - 3600000).toISOString(), ip: "192.168.1.55" },
  { id: 3, action: "Failed login attempt", user: "unknown", time: new Date(Date.now() - 7200000).toISOString(), ip: "103.24.55.12" },
  { id: 4, action: "Claim PK-100294 created", user: "system_api", time: new Date(Date.now() - 86400000).toISOString(), ip: "10.0.0.1" },
];

const mockUsers = [
  { id: 1, email: "admin@payclaim.pk", role: "Super Admin", status: "Active", lastLogin: new Date().toISOString() },
  { id: 2, email: "reviewer1@payclaim.pk", role: "Reviewer", status: "Active", lastLogin: new Date(Date.now() - 172800000).toISOString() },
  { id: 3, email: "auditor@payclaim.pk", role: "Auditor", status: "Suspended", lastLogin: new Date(Date.now() - 500000000).toISOString() },
];

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [activeTab, setActiveTab] = useState<"claims" | "logs" | "users" | "export">("claims");

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
    if (isAuthenticated) {
      fetchClaims();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginEmail === "admin" && loginPassword === "admin") {
      setIsAuthenticated(true);
      setLoginError("");
    } else {
      setLoginError("Invalid credentials. Use admin/admin for demo.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setLoginEmail("");
    setLoginPassword("");
  };

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

  const exportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Claim ID,Amount,Beneficiary,Status,Date\n"
      + claims.map(c => `${c.id},${c.amount},${c.fullName || "N/A"},${c.status},${new Date(c.createdAt).toLocaleDateString()}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `payclaim_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-20">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-slate-200">
             <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-center text-slate-900 mb-2">Admin Portal</h1>
          <p className="text-center text-slate-500 text-sm mb-8">Sign in to manage claims and verification logs.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100 text-center font-medium">
                {loginError}
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Email / Username</label>
              <input 
                type="text" 
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                placeholder="admin"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Password</label>
              <input 
                type="password" 
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                placeholder="admin"
              />
            </div>
            <button type="submit" className="w-full py-4 mt-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all shadow-lg active:scale-95">
              Secure Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  const filteredClaims = claims.filter(c => 
    c.id.toLowerCase().includes(search.toLowerCase()) || 
    c.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    c.mobileNumber?.includes(search)
  ).reverse();

  return (
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 flex flex-col gap-2 shrink-0">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-slate-900">Admin Portal</h1>
          <p className="text-xs text-emerald-600 font-bold uppercase tracking-widest mt-1">Super Admin Role</p>
        </div>

        <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0">
          <button 
            onClick={() => setActiveTab("claims")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-colors whitespace-nowrap ${activeTab === 'claims' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <FileText className="w-5 h-5" /> Claims Management
          </button>
          <button 
            onClick={() => setActiveTab("logs")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-colors whitespace-nowrap ${activeTab === 'logs' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <ShieldAlert className="w-5 h-5" /> Security & Audit
          </button>
          <button 
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-colors whitespace-nowrap ${activeTab === 'users' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <Users className="w-5 h-5" /> User Access
          </button>
          <button 
            onClick={() => setActiveTab("export")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-colors whitespace-nowrap ${activeTab === 'export' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <Download className="w-5 h-5" /> Export Data
          </button>
        </nav>

        <button 
          onClick={handleLogout}
          className="mt-4 md:mt-auto flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" /> Secure Logout
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0">
        {activeTab === "claims" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <h2 className="text-xl font-bold text-slate-900">Review & Manage Claims</h2>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button 
                  onClick={() => setShowNewForm(!showNewForm)}
                  className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" /> New Legitimate Claim
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
                      <th className="px-6 py-4 text-right">Actions / Review</th>
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
                            className="text-xs font-bold bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                            value={claim.status}
                            onChange={(e) => updateStatus(claim.id, e.target.value as ClaimStatus)}
                          >
                            <option value="Unclaimed">Unclaimed</option>
                            <option value="Pending Verification">Pending Verification</option>
                            <option value="Approved">Approve Claim</option>
                            <option value="Payment Processing">Process Payment</option>
                            <option value="Paid">Mark as Paid</option>
                            <option value="Rejected">Reject Claim</option>
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
          </motion.div>
        )}

        {activeTab === "logs" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
             <h2 className="text-xl font-bold text-slate-900 mb-6">Security & Audit Logs</h2>
             <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4">Timestamp</th>
                      <th className="px-6 py-4">Action</th>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">IP Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {mockAuditLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 text-slate-500 font-mono text-xs">{new Date(log.time).toLocaleString()}</td>
                        <td className="px-6 py-4 font-medium text-slate-900">{log.action}</td>
                        <td className="px-6 py-4 text-slate-600">{log.user}</td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-500">{log.ip}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </motion.div>
        )}

        {activeTab === "users" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
             <h2 className="text-xl font-bold text-slate-900 mb-6">User Access Management</h2>
             <div className="grid gap-4">
                {mockUsers.map(user => (
                  <div key={user.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">{user.email}</h3>
                      <div className="flex gap-4 mt-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">{user.role}</span>
                        <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md ${user.status === 'Active' ? 'text-blue-600 bg-blue-50' : 'text-red-600 bg-red-50'}`}>{user.status}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                       <button className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200">
                         {user.status === 'Active' ? <UserX className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
                       </button>
                    </div>
                  </div>
                ))}
             </div>
          </motion.div>
        )}

        {activeTab === "export" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
             <h2 className="text-xl font-bold text-slate-900 mb-6">Export Transactions</h2>
             <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm max-w-2xl">
               <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6">
                 <FileText className="w-8 h-8" />
               </div>
               <h3 className="text-2xl font-bold text-slate-900 mb-2">Download Legitimate Records</h3>
               <p className="text-slate-600 mb-8 leading-relaxed">
                 Export all processed claims and transaction histories into a secure CSV format for internal accounting and compliance audits. 
                 This export contains sensitive PII and must be handled securely.
               </p>
               <button 
                 onClick={exportData}
                 className="flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95"
               >
                 <Download className="w-5 h-5" /> Export {claims.length} Records (CSV)
               </button>
             </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
