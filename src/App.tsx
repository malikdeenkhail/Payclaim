/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from "react-router";
import LandingPage from "./components/LandingPage";
import ClaimFlow from "./components/ClaimFlow";
import ClaimStatus from "./components/ClaimStatus";
import AdminDashboard from "./components/AdminDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-200 flex flex-col">
        <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
              <span className="text-white font-bold text-xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </span>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-800 leading-tight">PayClaim PK</h1>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold hidden sm:block">Independent Claim Verification</p>
            </div>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="hidden md:flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-tighter">Secure Session Active</span>
            </div>
            <div className="h-8 w-px bg-slate-200 hidden md:block"></div>
            <nav className="flex gap-4 sm:gap-6 text-sm font-semibold text-slate-600">
              <a href="/" className="hover:text-emerald-600 transition-colors">Home</a>
              <a href="/admin" className="hover:text-emerald-600 transition-colors">Admin</a>
            </nav>
          </div>
        </header>

        <main className="flex-1 flex flex-col w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/claim" element={<ClaimFlow />} />
            <Route path="/status/:id" element={<ClaimStatus />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>
        
        <footer className="bg-slate-100 h-10 border-t border-slate-200 px-6 flex items-center justify-between w-full mt-auto">
          <div className="flex items-center gap-4 hidden sm:flex">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">System Status:</span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
              <span className="text-[10px] font-mono font-bold text-slate-600">Gateways Nominal</span>
            </span>
          </div>
          <div className="text-[10px] font-mono text-slate-400 flex items-center justify-center w-full sm:w-auto">
            © {new Date().getFullYear()} PayClaim PK. Not affiliated with JazzCash or Easypaisa.
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
