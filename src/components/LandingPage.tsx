import { useNavigate } from "react-router";
import { ShieldCheck, ArrowRight, Wallet, MapPin } from "lucide-react";
import { motion } from "motion/react";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center max-w-4xl mx-auto text-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-sm font-medium mb-8"
      >
        <ShieldCheck className="w-4 h-4" />
        Secure Verification Portal
      </motion.div>
      
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6"
      >
        Claim Your Payment <span className="text-emerald-600">Securely</span>
      </motion.h1>
      
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl"
      >
        If you have received a payment claim reference, you can securely verify your identity and select your preferred payout method (JazzCash, Easypaisa, or Bank Transfer).
      </motion.p>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="w-full max-w-md bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 mb-16"
      >
        <h2 className="text-xl font-bold mb-6 text-slate-800">Start Your Claim</h2>
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const claimId = formData.get("claimId")?.toString().trim();
            if (claimId) {
              navigate(`/claim?id=${claimId}`);
            }
          }}
          className="flex flex-col gap-4"
        >
          <div className="text-center mb-6">
            <label htmlFor="claimId" className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">
              Loan Amount
            </label>
            <div className="relative w-full">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-bold text-slate-400 pointer-events-none">Rs.</span>
              <input 
                type="text" 
                id="claimId" 
                name="claimId" 
                defaultValue="50000"
                placeholder="50000" 
                required
                className="w-full pl-20 pr-6 py-6 text-5xl font-black text-slate-900 rounded-3xl border-2 border-emerald-100 bg-emerald-50/50 focus:bg-white focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-center shadow-sm"
              />
            </div>
          </div>
          <div className="text-left">
            <label htmlFor="userNumber" className="block text-sm font-medium text-slate-700 mb-1">
              User Number
            </label>
            <input 
              type="tel" 
              id="userNumber" 
              name="userNumber" 
              placeholder="Enter your phone number" 
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400"
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2 shadow-lg"
          >
            Get Money <ArrowRight className="w-5 h-5" />
          </button>
        </form>
        <p className="text-[11px] text-slate-500 mt-4 uppercase tracking-wider font-semibold">
          We will never ask for your ATM PIN, MPIN, or passwords.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8 text-left max-w-4xl w-full">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Safe & Transparent</h3>
          <p className="text-slate-600 text-sm">We only request information strictly necessary to process your legitimate claim safely.</p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
            <MapPin className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Location Verification</h3>
          <p className="text-slate-600 text-sm">Location checks help prevent fraud. We explicitly ask for permission and never track you secretly.</p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
            <Wallet className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Multiple Options</h3>
          <p className="text-slate-600 text-sm">Receive funds in your JazzCash wallet, Easypaisa account, or directly to your bank.</p>
        </motion.div>
      </div>
    </div>
  );
}
