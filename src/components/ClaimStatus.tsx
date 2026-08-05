import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { motion } from "motion/react";
import { CheckCircle2, Clock, XCircle, Loader2, ArrowLeft, Receipt } from "lucide-react";
import type { PaymentClaim } from "../types";

export default function ClaimStatus() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [claim, setClaim] = useState<PaymentClaim | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    const fetchStatus = () => {
      fetch(`/api/claims/${id}`)
        .then(res => res.json())
        .then(data => {
          if (data.error) throw new Error(data.error);
          setClaim(data.claim);
        })
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>;
  }

  if (error || !claim) {
    return (
      <div className="max-w-md mx-auto bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-red-900 mb-2">Error</h2>
        <p className="text-red-700">{error || "Claim not found."}</p>
        <button onClick={() => navigate("/")} className="mt-6 px-4 py-2 bg-red-100 text-red-800 rounded-xl font-medium hover:bg-red-200 transition-colors">
          Go Home
        </button>
      </div>
    );
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "Pending Verification":
      case "Payment Processing":
        return { icon: <Clock className="w-8 h-8 text-amber-500" />, bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-800" };
      case "Approved":
      case "Paid":
        return { icon: <CheckCircle2 className="w-8 h-8 text-emerald-500" />, bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-800" };
      case "Rejected":
        return { icon: <XCircle className="w-8 h-8 text-red-500" />, bg: "bg-red-50", border: "border-red-200", text: "text-red-800" };
      default:
        return { icon: <Clock className="w-8 h-8 text-slate-500" />, bg: "bg-slate-50", border: "border-slate-200", text: "text-slate-800" };
    }
  };

  const config = getStatusConfig(claim.status);

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full max-w-5xl mx-auto">
      {/* Left Column: Claim Summary Card */}
      <aside className="w-full md:w-1/3 flex flex-col gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-4">Payment Details</h2>
          <div className="space-y-4">
            <div>
              <label className="text-[11px] text-slate-500">Available Amount</label>
              <p className="text-3xl font-bold text-slate-900">Rs. {claim.amount.toLocaleString()}</p>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-slate-500">Reference Number</span>
                <span className="text-xs font-mono font-semibold text-slate-800">{claim.id}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-slate-500">Issue Date</span>
                <span className="text-xs font-semibold text-slate-800">{new Date(claim.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-start mt-2 pt-2 border-t border-slate-100">
                 <span className="text-xs text-slate-500">Description</span>
                 <span className="text-xs font-semibold text-slate-800 text-right max-w-[150px]">{claim.reason}</span>
              </div>
            </div>
          </div>
        </div>

        <button onClick={() => navigate("/")} className="w-full py-4 mt-auto bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 text-sm">
          <ArrowLeft className="w-4 h-4" /> Return to Home
        </button>
      </aside>

      {/* Right Column: Active Claim Flow */}
      <section className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col relative overflow-hidden">
        {/* Progress Stepper */}
        <div className="px-6 md:px-8 pt-8">
          <div className="flex items-center justify-between relative mb-6">
            <div className="absolute h-0.5 bg-slate-100 w-full top-1/2 -translate-y-1/2 z-0"></div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs bg-emerald-600 text-white shadow-md shadow-emerald-200">1</div>
              <span className="text-[10px] font-bold mt-2 uppercase tracking-wider text-emerald-700">Verification</span>
            </div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs bg-emerald-600 text-white shadow-md shadow-emerald-200">2</div>
              <span className="text-[10px] font-bold mt-2 uppercase tracking-wider text-emerald-700">Details</span>
            </div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs bg-emerald-600 text-white shadow-md shadow-emerald-200">3</div>
              <span className="text-[10px] font-bold mt-2 uppercase tracking-wider text-emerald-700">Status</span>
            </div>
          </div>
        </div>

        {/* Active Step Content */}
        <div className="flex-1 px-6 md:px-12 py-4 pb-8">
          <div className="max-w-md mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`rounded-2xl border overflow-hidden ${config.border}`}>
              <div className={`p-8 text-center flex flex-col items-center border-b ${config.bg} ${config.border}`}>
                {config.icon}
                <h2 className={`text-2xl font-bold mt-4 ${config.text}`}>{claim.status}</h2>
                <p className={`text-sm mt-2 font-medium opacity-80 ${config.text}`}>Claim ID: {claim.id}</p>
              </div>

              <div className="p-6 md:p-8 bg-white space-y-4">
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium text-slate-500">Payment Method</span>
                  <span className="text-sm font-bold text-slate-900">{claim.paymentMethod || "Pending"}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-t border-slate-100">
                  <span className="text-sm font-medium text-slate-500">Beneficiary Name</span>
                  <span className="text-sm font-bold text-slate-900">{claim.fullName || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-t border-slate-100">
                  <span className="text-sm font-medium text-slate-500">Mobile Number</span>
                  <span className="text-sm font-bold text-slate-900">{claim.mobileNumber || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-t border-slate-100">
                  <span className="text-sm font-medium text-slate-500">Date Requested</span>
                  <span className="text-sm font-bold text-slate-900">
                    {claim.updatedAt ? new Date(claim.updatedAt).toLocaleDateString() : new Date(claim.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {claim.transactionReference && (
                  <div className="flex justify-between items-center py-3 px-4 bg-emerald-50 rounded-xl mt-4 border border-emerald-100">
                    <span className="text-sm font-medium text-emerald-800">Transaction Ref</span>
                    <span className="text-sm font-bold text-emerald-900 font-mono tracking-tight">{claim.transactionReference}</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Compliance Footer */}
        <div className="p-4 md:p-6 bg-slate-50 border-t border-slate-200 mt-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <div className="flex gap-4">
              <span className="text-[10px] text-slate-400 font-semibold">GDPR Compliant</span>
              <span className="text-[10px] text-slate-400 font-semibold">SEC-256 Encrypted</span>
            </div>
            <p className="text-[10px] font-semibold text-slate-400">SANDBOX/DEMO ENVIRONMENT</p>
          </div>
        </div>
      </section>
    </div>
  );
}
