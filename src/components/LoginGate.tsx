"use client";

import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Shield, KeyRound, Mail, AlertTriangle, CheckCircle, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

interface LoginGateProps {
  onLoginSuccess: () => void;
}

export default function LoginGate({ onLoginSuccess }: LoginGateProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const testEmail = "reviewer@techfiesta.org";
  const testPassword = "RazorpayTest2026!";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formattedEmail = email.trim().toLowerCase();

    // Check if Firebase Auth is initialized and operational
    if (auth) {
      try {
        await signInWithEmailAndPassword(auth, formattedEmail, password);
        toast.success("Authentication successful! Decrypting portal...");
        onLoginSuccess();
      } catch (err: any) {
        console.error("Firebase Login Error:", err);

        // Fallback check: If Firebase auth fails (e.g. database offline or config not loaded on Vercel yet),
        // we allow standard verification against the reviewer credentials to prevent blockages during application review.
        if (formattedEmail === testEmail && password === testPassword) {
          console.warn("Firebase Auth failed, but credentials matched test user. Access granted via local bypass.");
          toast.success("Mock authentication successful! Access granted.");
          onLoginSuccess();
        } else {
          let errorMsg = "Invalid email or password.";
          if (err.code === "auth/invalid-credential") {
            errorMsg = "Invalid credentials. Please check your username and password.";
          } else if (err.code === "auth/user-not-found") {
            errorMsg = "No account found with this email.";
          } else if (err.code === "auth/wrong-password") {
            errorMsg = "Incorrect password.";
          }
          setError(errorMsg);
          toast.error(errorMsg);
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      // Local Bypass / Mock mode (when firebase is not configured/loaded)
      setTimeout(() => {
        if (formattedEmail === testEmail && password === testPassword) {
          toast.success("Offline Authentication successful!");
          onLoginSuccess();
        } else {
          setError("Invalid credentials. Please use the reviewer test account.");
          toast.error("Access denied.");
        }
        setIsLoading(false);
      }, 800);
    }
  };

  return (
    <div className="w-full flex items-center justify-center py-6 px-4">
      <div className="w-full max-w-md bg-black/85 border border-red-500/20 backdrop-blur-sm shadow-[0_0_35px_rgba(220,38,38,0.2)] rounded-2xl p-6 sm:p-8 relative overflow-hidden transition-all duration-300">

        {/* Cyberpunk background corner brackets */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-red-500/50 pointer-events-none" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-red-500/50 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-red-500/50 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-red-500/50 pointer-events-none" />

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 bg-red-500/10 border border-red-500/30 rounded-xl mb-4 text-red-500 animate-[pulse_2s_infinite]">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-bebas-neue)] tracking-wider text-white">
            Secure Portal Login
          </h2>
          <p className="text-xs font-mono text-red-500 tracking-widest uppercase mt-1">
            // SECURE CHECKOUT PROTOCOL ACTIVE
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2.5 text-red-300 text-xs font-mono">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-400 text-xs font-mono uppercase tracking-wider mb-1.5">
              Reviewer Username / Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
              <input
                type="email"
                required
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-red-500/20 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-red-500 focus:bg-white/10 focus:shadow-[0_0_15px_rgba(239,68,68,0.2)] transition-all duration-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 text-xs font-mono uppercase tracking-wider mb-1.5">
              Secure Passcode / Password
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
              <input
                type="password"
                required
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-red-500/20 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-red-500 focus:bg-white/10 focus:shadow-[0_0_15px_rgba(239,68,68,0.2)] transition-all duration-300"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_4px_12px_rgba(220,38,38,0.2)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Decrypting...
              </>
            ) : (
              <>
                Authenticate <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
