/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User, KeyRound, ShieldCheck, Mail, Save, AlertCircle } from "lucide-react";
import { SystemUser } from "../types";

interface AccountGatewayProps {
  currentUser: SystemUser;
  onUpdateUser: (updated: Partial<SystemUser>) => void;
}

export default function AccountGateway({ currentUser, onUpdateUser }: AccountGatewayProps) {
  const [username, setUsername] = useState(currentUser.username);
  const [email, setEmail] = useState(currentUser.email);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [is2faEnabling, setIs2faEnabling] = useState(false);
  const [totpCode, setTotpCode] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    if (!username.trim() || !email.trim()) {
      setFeedback({ type: "error", text: "Username and email fields cannot be empty." });
      return;
    }
    onUpdateUser({ username, email });
    setFeedback({ type: "success", text: "Self-service account profile metadata updated successfully." });
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!password) {
      setFeedback({ type: "error", text: "Please supply a valid security password password." });
      return;
    }
    if (password !== confirmPassword) {
      setFeedback({ type: "error", text: "Target security passwords do not match. Re-verify input." });
      return;
    }

    setFeedback({ type: "success", text: "Security password hash successfully changed on the system." });
    setPassword("");
    setConfirmPassword("");
  };

  const handleEnable2FA = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (totpCode === "123456") {
      onUpdateUser({ has2FA: true });
      setIs2faEnabling(false);
      setTotpCode("");
      setFeedback({ type: "success", text: "Multi-factor authentication (2FA) is now enabled for this admin account." });
    } else {
      setFeedback({ type: "error", text: "Invalid authentication token. Correct input: '123456'." });
    }
  };

  const handleDisable2FA = () => {
    onUpdateUser({ has2FA: false });
    setFeedback({ type: "success", text: "2FA authentication protections deactivated." });
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h2 className="text-xl font-display font-medium text-white tracking-tight">
          Self-Service Security Account
        </h2>
        <p className="text-xs text-gray-400 font-sans">
          Manage your credential parameters, override security passwords, and establish persistent authentication rules.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl border text-sm flex items-start gap-3 ${
            feedback.type === "success"
              ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-300"
              : "bg-rose-950/20 border-rose-500/20 text-rose-300"
          }`}
        >
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{feedback.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Settings form */}
        <div className="bg-[#11121d] p-6 rounded-xl border border-white/5 space-y-6 shadow-xs">
          <div className="flex items-center gap-2.5 border-b border-white/5 pb-3">
            <User className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider">
              Profile Configurations
            </h3>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block">
                Username Identifier
              </label>
              <input
                id="account-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#0a0b10] border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-hidden focus:border-indigo-500 font-sans"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  id="account-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0a0b10] border border-white/10 rounded-lg py-2 pl-9 pr-3 text-sm text-white focus:outline-hidden focus:border-indigo-500 font-sans"
                />
              </div>
            </div>

            <button
              id="account-profile-save"
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              Save Account Profile
            </button>
          </form>
        </div>

        {/* Change Password form */}
        <div className="bg-[#11121d] p-6 rounded-xl border border-white/5 space-y-6 shadow-xs">
          <div className="flex items-center gap-2.5 border-b border-white/5 pb-3">
            <KeyRound className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider">
              System Passwords Setup
            </h3>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block">
                New Secure Password
              </label>
              <input
                id="account-new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#0a0b10] border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-hidden focus:border-indigo-500 font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block">
                Confirm New Password
              </label>
              <input
                id="account-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#0a0b10] border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-hidden focus:border-indigo-500 font-mono"
              />
            </div>

            <button
              id="account-password-save"
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              Update System Password
            </button>
          </form>
        </div>
      </div>

      {/* 2FA Action block */}
      <div className="bg-[#11121d] p-6 rounded-xl border border-white/5 space-y-6 shadow-xs">
        <div className="flex items-center gap-2.5 border-b border-white/5 pb-3">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider">
            Multi-Factor Authentication Setup
          </h3>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <div className="flex-1 space-y-3">
            <p className="text-sm text-gray-300">
              Increase system node protection by enabling 2-Factor Authentication (2FA). This protocol intercepts login flows and prompts for randomized 6-digit cryptographic security tokens.
            </p>
            {currentUser.has2FA ? (
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-semibold">
                  MFA PROTECTION CORE: ENABLED
                </span>
                <button
                  id="account-2fa-disable"
                  onClick={handleDisable2FA}
                  className="px-3 py-1 bg-rose-950/20 hover:bg-rose-900/30 text-rose-400 rounded-lg font-mono text-xs border border-rose-500/20 cursor-pointer"
                >
                  Deactivate 2FA Core
                </button>
              </div>
            ) : (
              <div>
                <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg text-xs font-semibold inline-block mb-3">
                  MFA STATUS: CURRENTLY EXPOSED
                </span>
                <p className="text-xs text-gray-500">
                  Click the button below to display QR codes and initialize key storage parameters.
                </p>
                {!is2faEnabling && (
                  <button
                    id="account-2fa-enable-start"
                    onClick={() => {
                      setFeedback(null);
                      setIs2faEnabling(true);
                    }}
                    className="mt-3 px-4 py-2 bg-indigo-650 hover:bg-indigo-550 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Enable 2-Factor Authentication (2FA) Channel
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 2FA activation UI dialog */}
          {is2faEnabling && (
            <div className="w-full lg:w-96 p-4 rounded-xl border border-indigo-550/20 bg-indigo-950/10 space-y-4">
              <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-widest">
                Verification Setup Steps
              </h4>
              <div className="flex items-center gap-4 bg-black/30 p-3 rounded-lg border border-white/5">
                {/* Simulated QR block layout */}
                <div className="w-20 h-20 bg-white p-1 rounded-sm shrink-0 flex items-center justify-center">
                  <div className="grid grid-cols-5 gap-0.5 w-full h-full">
                    {Array(25).fill(0).map((_, i) => (
                      <div
                        key={i}
                        className={`rounded-xs ${
                          (i * 7 + 11) % 5 === 0 || (i % 3 === 0 && i > 5) ? "bg-[#0b0c10]" : "bg-white"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-gray-300 block leading-tight">
                    Scan using your Google Authenticator or relative secure keychain.
                  </span>
                  <span className="font-mono text-[9px] text-indigo-300 uppercase select-all block mt-1.5">
                    KEY: AETH J2AQ 4SL4 820K
                  </span>
                </div>
              </div>

              <form onSubmit={handleEnable2FA} className="space-y-2">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block">
                  Enter 6-Digit Simulated Token (Code: 123456)
                </label>
                <div className="flex gap-2">
                  <input
                    id="account-2fa-code"
                    type="text"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value)}
                    placeholder="123456"
                    className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-center font-mono text-sm tracking-widest text-[#22c55e] focus:outline-hidden"
                  />
                  <button
                    id="account-2fa-verify"
                    type="submit"
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Verify
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
