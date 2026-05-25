/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Eye, EyeOff, Lock, User, ShieldAlert, ArrowRight, Terminal } from "lucide-react";
import { motion } from "motion/react";

interface LoginGatewayProps {
  onSuccess: (username: string) => void;
}

export default function LoginGateway({ onSuccess }: LoginGatewayProps) {
  const [usernameOrEmail, setUsernameOrEmail] = useState("root");
  const [password, setPassword] = useState("skyport2026");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Simulate authentication check
    setTimeout(() => {
      if (usernameOrEmail.trim() !== "root" || password !== "skyport2026") {
        setError("Invalid credentials");
        setIsSubmitting(false);
      } else {
        // Success
        onSuccess(usernameOrEmail);
        setIsSubmitting(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#0d0e12] flex flex-col justify-center items-center p-4 selection:bg-[#10b981] selection:text-white relative overflow-hidden">
      {/* Background ambient glowing light highlights */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#10b981]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#ef4444]/5 blur-[120px] pointer-events-none" />

      {/* Header with Futuristic Vector Logo Placeholder */}
      <div className="mb-8 flex flex-col items-center text-center max-w-sm z-10 w-full mb-6">
        <div className="w-14 h-14 rounded-2xl bg-[#15171e] border-2 border-white/5 flex items-center justify-center mb-4 shadow-[0_4px_20px_rgba(16,185,129,0.15)]">
          <div className="w-8 h-8 rounded-lg bg-[#10b981]/10 border border-[#10b981]/20 flex items-center justify-center text-[#10b981]">
            <Terminal className="w-4 h-4" />
          </div>
        </div>
        <h1 className="font-display font-semibold text-2xl text-white tracking-tight">
          Skyport Alt
        </h1>
        <p className="font-sans text-xs text-[#9ca3af] mt-2 leading-relaxed">
          High-performance baremetal orchestrator and server node management console.
        </p>
      </div>

      {/* Glassmorphic login card with Layer 2 background */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={`w-full max-w-md p-8 bg-[#15171e] rounded-2xl border ${
          error ? "border-[#ef4444]" : "border-white/5"
        } shadow-[0_20px_40px_rgba(0,0,0,0.6)] transition-all z-10`}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email / Username field with Layer 3 background */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white tracking-wider uppercase block select-none">
              Username or Email
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-[#9ca3af]">
                <User className="w-4 h-4" />
              </span>
              <input
                id="login-username"
                type="text"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                placeholder="root"
                className="w-full bg-[#1e212b] border border-white/5 rounded-xl py-3 pl-10 pr-4 text-xs text-white placeholder-[#9ca3af]/30 focus:outline-hidden focus:border-[#10b981] transition-all font-sans"
              />
            </div>
          </div>

          {/* Password field with Layer 3 background */}
          <div className="space-y-2">
            <div className="flex justify-between items-center select-none">
              <label className="text-xs font-semibold text-white tracking-wider uppercase block">
                Password
              </label>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-[#9ca3af]">
                <Lock className="w-4 h-4" />
              </span>
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#1e212b] border border-white/5 rounded-xl py-3 pl-10 pr-12 text-xs text-white placeholder-[#9ca3af]/30 focus:outline-hidden focus:border-[#10b981] transition-all font-mono"
              />
              <button
                id="login-password-toggle"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-[#9ca3af] hover:text-white p-0.5 transition-colors cursor-pointer"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          {/* Red outline accent box for credentials failure */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -2 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#ef4444]/5 border border-[#ef4444] p-3.5 rounded-xl flex items-center gap-2.5"
            >
              <ShieldAlert className="w-4.5 h-4.5 text-[#ef4444] shrink-0" />
              <div className="text-xs text-[#ef4444] font-semibold font-sans">
                {error}
              </div>
            </motion.div>
          )}

          {/* Hint alert element */}
          <div className="text-[10px] text-[#9ca3af] bg-[#1e212b] p-3 rounded-lg border border-white/5 font-mono text-center select-none">
            Default: <span className="text-[#10b981] font-semibold">root</span> / <span className="text-[#10b981] font-semibold">skyport2026</span>
          </div>

          {/* Sign In button with emerald green accent */}
          <button
            id="login-submit"
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 bg-[#10b981] hover:bg-[#10b981]/90 disabled:bg-[#10b981]/50 text-white rounded-xl flex items-center justify-center gap-2 font-semibold text-xs transition-all focus:outline-hidden cursor-pointer select-none group"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Sign In to Skyport
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </form>
      </motion.div>

      {/* Footer System Credits */}
      <div className="mt-12 text-[10px] text-[#9ca3af]/40 font-mono tracking-widest uppercase flex items-center gap-1.5 pointer-events-none select-none">
        <span>Skyport OS</span>
        <span className="text-white/10">•</span>
        <span>Build 6d0370</span>
      </div>
    </div>
  );
}
