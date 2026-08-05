import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { motion } from "motion/react";
import { MapPin, ShieldAlert, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import type { PaymentClaim, PaymentMethod } from "../types";

export default function ClaimFlow() {
  const [searchParams] = useSearchParams();
  const claimId = searchParams.get("id");
  const navigate = useNavigate();

  const [claim, setClaim] = useState<PaymentClaim | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [step, setStep] = useState<"location" | "identity" | "details" | "verifying">("location");
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationError, setLocationError] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("JazzCash");
  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");

  useEffect(() => {
    if (!claimId) {
      setError("No claim ID provided.");
      setLoading(false);
      return;
    }

    fetch(`/api/claims/${claimId}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        if (data.claim.status !== "Unclaimed") {
          navigate(`/status/${claimId}`);
          return;
        }
        setClaim(data.claim);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [claimId, navigate]);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationError(true);
      setStep("details");
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setStep("identity");
      },
      () => {
        setLocationError(true);
        setStep("identity"); // Allow continuing even if denied
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep("verifying");
    setError("");

    try {
      const res = await fetch(`/api/claims/${claimId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          mobileNumber,
          paymentMethod,
          location
        })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      // Simulate verification delay
      setTimeout(() => {
        navigate(`/status/${claimId}`);
      }, 2500);

    } catch (err: any) {
      setError(err.message);
      setStep("details");
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>;
  }

  if (error || !claim) {
    return (
      <div className="max-w-md mx-auto bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-red-900 mb-2">Claim Error</h2>
        <p className="text-red-700">{error || "Claim not found."}</p>
        <button onClick={() => navigate("/")} className="mt-6 px-4 py-2 bg-red-100 text-red-800 rounded-xl font-medium hover:bg-red-200 transition-colors">
          Go Back
        </button>
      </div>
    );
  }

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

        <div className="bg-slate-900 rounded-2xl p-5 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="bg-white/10 p-2 rounded-lg shrink-0">
              <ShieldAlert className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-white font-medium text-sm">Fraud Prevention Notice</p>
              <p className="text-white/60 text-[11px] mt-1 leading-relaxed">
                We will never ask for your MPIN, OTP, or Password. This is an independent claim verification portal.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 mt-auto hidden md:block">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase text-slate-400">Location Status</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${location ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
              {location ? 'AUTHORIZED' : 'PENDING'}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 italic">We use location for fraud prevention only. Your data is never shared.</p>
        </div>
      </aside>

      {/* Right Column: Active Claim Flow */}
      <section className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col relative overflow-hidden">
        {/* Progress Stepper */}
        <div className="px-6 md:px-8 pt-8">
          <div className="flex items-center justify-between relative mb-6">
            {/* Background Line */}
            <div className="absolute h-0.5 bg-slate-100 w-full top-1/2 -translate-y-1/2 z-0 rounded-full"></div>
            {/* Active Progress Line */}
            <div className={`absolute h-0.5 bg-emerald-500 top-1/2 -translate-y-1/2 z-0 rounded-full transition-all duration-500 ease-in-out ${step === 'location' ? 'w-0' : step === 'identity' ? 'w-1/3' : step === 'details' ? 'w-2/3' : 'w-full'}`}></div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs bg-emerald-600 text-white shadow-md shadow-emerald-200 transition-all duration-500 ring-4 ring-white">
                {step === 'location' ? '1' : <CheckCircle2 className="w-4 h-4" />}
              </div>
              <span className="text-[10px] font-bold mt-2 uppercase tracking-wider text-emerald-700">Location</span>
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-500 ring-4 ring-white ${(step === 'identity' || step === 'details' || step === 'verifying') ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                {(step === 'details' || step === 'verifying') ? <CheckCircle2 className="w-4 h-4" /> : '2'}
              </div>
              <span className={`text-[10px] font-bold mt-2 uppercase tracking-wider transition-colors duration-500 ${(step === 'identity' || step === 'details' || step === 'verifying') ? 'text-emerald-700' : 'text-slate-400'}`}>Identity</span>
            </div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-500 ring-4 ring-white ${(step === 'details' || step === 'verifying') ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                {step === 'verifying' ? <CheckCircle2 className="w-4 h-4" /> : '3'}
              </div>
              <span className={`text-[10px] font-bold mt-2 uppercase tracking-wider transition-colors duration-500 ${(step === 'details' || step === 'verifying') ? 'text-emerald-700' : 'text-slate-400'}`}>Details</span>
            </div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-500 ring-4 ring-white ${step === 'verifying' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200 animate-pulse' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>4</div>
              <span className={`text-[10px] font-bold mt-2 uppercase tracking-wider transition-colors duration-500 ${step === 'verifying' ? 'text-emerald-700' : 'text-slate-400'}`}>Status</span>
            </div>
          </div>
        </div>

        {/* Active Step Content */}
        <div className="flex-1 px-6 md:px-12 py-4">
          <div className="max-w-md mx-auto">
            {step === "location" && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="text-center pb-8">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MapPin className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Location Verification</h3>
                <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                  We use your location only for verification and security purposes to prevent fraudulent claims. Your location will not be sold or shared.
                </p>
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={requestLocation}
                    className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:shadow-slate-200 active:scale-95 transition-all"
                  >
                    Allow Secure Location Check
                  </button>
                  <button 
                    onClick={() => {
                      setLocationError(true);
                      setStep("identity");
                    }}
                    className="w-full py-4 bg-white text-slate-600 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 active:scale-95 transition-all"
                  >
                    Continue Without Location
                  </button>
                </div>
              </motion.div>
            )}

            {step === "identity" && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="pb-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-slate-800 mb-1">Identity Verification</h3>
                  <p className="text-sm text-slate-500">Please provide clear photos of your CNIC and a live selfie to verify your identity.</p>
                </div>
                
                <div className="flex flex-col gap-5">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">CNIC Front</label>
                      <input type="file" accept="image/*" capture="environment" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">CNIC Back</label>
                      <input type="file" accept="image/*" capture="environment" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Live Photo (Selfie)</label>
                      <input type="file" accept="image/*" capture="user" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                    </div>
                  </div>

                  <button 
                    onClick={() => setStep("details")}
                    className="w-full py-4 mt-4 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:shadow-slate-200 active:scale-95 transition-all"
                  >
                    Continue to Payment Details
                  </button>
                </div>
              </motion.div>
            )}

            {step === "details" && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="pb-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-slate-800 mb-1">Select Receiving Method</h3>
                  <p className="text-sm text-slate-500">Choose how you would like to receive your verified payment claim.</p>
                </div>
                
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div className="space-y-3">
                    {/* JazzCash Option */}
                    <label className={`w-full flex items-center justify-between p-4 rounded-xl cursor-pointer transition-colors group ${paymentMethod === 'JazzCash' ? 'border-2 border-emerald-500 bg-emerald-50/50' : 'border border-slate-200 bg-white hover:border-slate-300'}`}>
                      <input type="radio" name="paymentMethod" className="sr-only" checked={paymentMethod === 'JazzCash'} onChange={() => setPaymentMethod('JazzCash')} />
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 bg-white rounded-lg shadow-sm border border-slate-100 flex items-center justify-center font-bold text-xs ${paymentMethod === 'JazzCash' ? 'text-emerald-600' : 'text-slate-400'}`}>JAZZ</div>
                        <div className="text-left">
                          <p className="font-bold text-slate-800">JazzCash Wallet</p>
                          <p className="text-[11px] text-slate-500">Instant transfer to registered mobile</p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${paymentMethod === 'JazzCash' ? 'border-2 border-emerald-600' : 'border-2 border-slate-200'}`}>
                        {paymentMethod === 'JazzCash' && <div className="w-2.5 h-2.5 rounded-full bg-emerald-600"></div>}
                      </div>
                    </label>

                    {/* Easypaisa Option */}
                    <label className={`w-full flex items-center justify-between p-4 rounded-xl cursor-pointer transition-colors group ${paymentMethod === 'Easypaisa' ? 'border-2 border-emerald-500 bg-emerald-50/50' : 'border border-slate-200 bg-white hover:border-slate-300'}`}>
                      <input type="radio" name="paymentMethod" className="sr-only" checked={paymentMethod === 'Easypaisa'} onChange={() => setPaymentMethod('Easypaisa')} />
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 bg-white rounded-lg shadow-sm border border-slate-100 flex items-center justify-center font-bold text-xs ${paymentMethod === 'Easypaisa' ? 'text-emerald-600' : 'text-slate-400'}`}>EASY</div>
                        <div className="text-left">
                          <p className="font-bold text-slate-800">Easypaisa</p>
                          <p className="text-[11px] text-slate-500">Available for all mobile networks</p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${paymentMethod === 'Easypaisa' ? 'border-2 border-emerald-600' : 'border-2 border-slate-200'}`}>
                        {paymentMethod === 'Easypaisa' && <div className="w-2.5 h-2.5 rounded-full bg-emerald-600"></div>}
                      </div>
                    </label>

                    {/* Bank Transfer Option */}
                    <label className={`w-full flex items-center justify-between p-4 rounded-xl cursor-pointer transition-colors group ${paymentMethod === 'Bank Transfer' ? 'border-2 border-emerald-500 bg-emerald-50/50' : 'border border-slate-200 bg-white hover:border-slate-300'}`}>
                      <input type="radio" name="paymentMethod" className="sr-only" checked={paymentMethod === 'Bank Transfer'} onChange={() => setPaymentMethod('Bank Transfer')} />
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 bg-white rounded-lg shadow-sm border border-slate-100 flex items-center justify-center ${paymentMethod === 'Bank Transfer' ? 'text-emerald-600' : 'text-slate-400'}`}>
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10v11m16-11v11M8 10v11m4-11v11m4-11v11" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-slate-800">Direct Bank Transfer</p>
                          <p className="text-[11px] text-slate-500">All IBAN supported (1-2 business days)</p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${paymentMethod === 'Bank Transfer' ? 'border-2 border-emerald-600' : 'border-2 border-slate-200'}`}>
                        {paymentMethod === 'Bank Transfer' && <div className="w-2.5 h-2.5 rounded-full bg-emerald-600"></div>}
                      </div>
                    </label>
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                        Full Legal Name
                      </label>
                      <input 
                        type="text" 
                        required 
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        placeholder="As per CNIC/Account"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-400 text-sm font-medium text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                        Mobile Number
                      </label>
                      <input 
                        type="tel" 
                        required 
                        pattern="^03\d{9}$"
                        value={mobileNumber}
                        onChange={e => setMobileNumber(e.target.value)}
                        placeholder="03XXXXXXXXX"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-400 text-sm font-medium text-slate-900"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-4 mt-4 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:shadow-slate-200 active:scale-95 transition-all"
                  >
                    Proceed to Secure Verification
                  </button>
                </form>
              </motion.div>
            )}

            {step === "verifying" && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
                <Loader2 className="w-16 h-16 animate-spin text-emerald-600 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Verification in Progress</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  Please wait while we securely process your details with our gateways. Do not close this page.
                </p>
                <div className="mt-8 text-[10px] font-mono text-slate-400 bg-slate-50 p-2 border border-slate-200 rounded-lg inline-block">
                  DEMO ENVIRONMENT - NO REAL TRANSACTIONS
                </div>
              </motion.div>
            )}
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
