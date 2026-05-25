/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Settings, Mail, Palette, Save, Upload, Sliders, ToggleLeft, ToggleRight, Check } from "lucide-react";
import { PanelSettings } from "../types";

interface AdminSettingsProps {
  settings: PanelSettings;
  onSaveSettings: (updated: PanelSettings) => void;
}

export default function AdminSettings({ settings, onSaveSettings }: AdminSettingsProps) {
  const [activeTab, setActiveTab] = useState<"general" | "smtp" | "theme">("general");
  const [panelName, setPanelName] = useState(settings.panelName);
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl);
  const [allowRegistration, setAllowRegistration] = useState(settings.allowRegistration);
  const [forceEmailVerification, setForceEmailVerification] = useState(settings.forceEmailVerification);

  // SMTP States
  const [smtpHost, setSmtpHost] = useState(settings.smtpHost);
  const [smtpPort, setSmtpPort] = useState(settings.smtpPort);
  const [smtpUser, setSmtpUser] = useState(settings.smtpUser);
  const [smtpSecure, setSmtpSecure] = useState(settings.smtpSecure);

  // Theme states
  const [activeTheme, setActiveTheme] = useState(settings.activeTheme);

  const [savedBadge, setSavedBadge] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      panelName,
      logoUrl,
      allowRegistration,
      forceEmailVerification,
      smtpHost,
      smtpPort,
      smtpUser,
      smtpSecure,
      activeTheme,
    });
    setSavedBadge(true);
    setTimeout(() => setSavedBadge(false), 2000);
  };

  const handleLogoUploadSimulate = () => {
    // Simulate interactive file upload
    const mockUrls = [
      "https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=120&h=120&fit=crop",
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&h=120&fit=crop",
      "https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=120&h=120&fit=crop"
    ];
    const randomized = mockUrls[Math.floor(Math.random() * mockUrls.length)];
    setLogoUrl(randomized);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex justify-between items-center bg-[#11121d] p-5 rounded-xl border border-white/5 shadow-xs">
        <div>
          <h2 className="text-xl font-display font-medium text-white tracking-tight">
            System Configuration Node
          </h2>
          <p className="text-xs text-gray-400 font-sans">
            Customize routing rules, security verify flows, SMTP transmitters, and panel visual identities.
          </p>
        </div>
        {savedBadge && (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-450 border border-emerald-500/25 rounded-md text-xs font-semibold animate-bounce">
            <Check className="w-3.5 h-3.5" /> Configurations Saved!
          </span>
        )}
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-white/5 gap-1.5 overflow-x-auto">
        <button
          onClick={() => setActiveTab("general")}
          className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 cursor-pointer flex items-center gap-1.5 ${
            activeTab === "general"
              ? "text-indigo-400 border-indigo-500"
              : "text-gray-400 hover:text-white border-transparent"
          }`}
        >
          <Sliders className="w-4 h-4" />
          General adjustments
        </button>

        <button
          onClick={() => setActiveTab("smtp")}
          className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 cursor-pointer flex items-center gap-1.5 ${
            activeTab === "smtp"
              ? "text-indigo-400 border-indigo-500"
              : "text-gray-400 hover:text-white border-transparent"
          }`}
        >
          <Mail className="w-4 h-4" />
          SMTP Server
        </button>

        <button
          onClick={() => setActiveTab("theme")}
          className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 cursor-pointer flex items-center gap-1.5 ${
            activeTab === "theme"
              ? "text-indigo-400 border-indigo-500"
              : "text-gray-400 hover:text-white border-transparent"
          }`}
        >
          <Palette className="w-4 h-4" />
          Themes Setup
        </button>
      </div>

      {/* Forms Area wrapper */}
      <form onSubmit={handleSubmit} className="bg-[#11121d] p-6 rounded-xl border border-white/5 shadow-xs spacing-y-8">
        {activeTab === "general" && (
          <div className="space-y-6">
            <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider border-b border-white/5 pb-2.5">
              General Panel Variables
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block">
                  Panel Brand Naming
                </label>
                <input
                  id="setting-panel-name"
                  type="text"
                  value={panelName}
                  onChange={(e) => setPanelName(e.target.value)}
                  className="w-full bg-[#0a0b10] border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-hidden focus:border-indigo-500 font-sans"
                />
              </div>

              {/* Logo upload block */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block">
                  Console Launcher Logo
                </label>
                <div className="flex gap-3 items-center">
                  <img
                    src={logoUrl || undefined}
                    alt="Panel Logo"
                    className="w-12 h-12 rounded-lg object-cover bg-black/50 border border-white/5"
                    referrerPolicy="no-referrer"
                  />
                  <input
                    id="setting-logo-url"
                    type="text"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    className="flex-1 bg-[#0a0b10] border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-hidden focus:border-indigo-500 font-mono text-xs"
                  />
                  <button
                    id="setting-logo-upload"
                    type="button"
                    onClick={handleLogoUploadSimulate}
                    className="p-2.5 bg-neutral-800 hover:bg-neutral-700 text-gray-300 rounded-lg border border-white/5 text-xs font-semibold cursor-pointer"
                    title="Simulate image upload"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Swappable toggle options */}
            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="flex items-center justify-between bg-black/30 p-3.5 rounded-xl border border-white/4">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-gray-200">Register Page Gateway</span>
                  <p className="text-[11px] text-gray-500">Allow user accounts to self-register via login gateway screens.</p>
                </div>
                <button
                  id="setting-toggle-register"
                  type="button"
                  onClick={() => setAllowRegistration(!allowRegistration)}
                  className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  {allowRegistration ? (
                    <ToggleRight className="w-10 h-10 text-indigo-505 text-indigo-450 fill-current" />
                  ) : (
                    <ToggleLeft className="w-10 h-10 text-gray-600" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between bg-black/30 p-3.5 rounded-xl border border-white/4">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-gray-200">Force Verify Email Address</span>
                  <p className="text-[11px] text-gray-500">Block game server provisions until users verify email structures.</p>
                </div>
                <button
                  id="setting-toggle-verify"
                  type="button"
                  onClick={() => setForceEmailVerification(!forceEmailVerification)}
                  className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  {forceEmailVerification ? (
                    <ToggleRight className="w-10 h-10 text-indigo-400 fill-current" />
                  ) : (
                    <ToggleLeft className="w-10 h-10 text-gray-600" />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "smtp" && (
          <div className="space-y-6">
            <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider border-b border-white/5 pb-2.5">
              SMTP Transmission Hub Configuration
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block">
                  SMTP Host Address
                </label>
                <input
                  id="setting-smtp-host"
                  type="text"
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  className="w-full bg-[#0a0b10] border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-hidden focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block">
                  SMTP Server Net Port
                </label>
                <input
                  id="setting-smtp-port"
                  type="number"
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(parseInt(e.target.value))}
                  className="w-full bg-[#0a0b10] border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-hidden focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block">
                  SMTP Sender Profile Username
                </label>
                <input
                  id="setting-smtp-user"
                  type="text"
                  value={smtpUser}
                  onChange={(e) => setSmtpUser(e.target.value)}
                  className="w-full bg-[#0a0b10] border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-hidden focus:border-indigo-500 font-sans"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block">
                  SSL/TLS Protocol Security
                </label>
                <div className="flex items-center gap-3 h-10">
                  <input
                    id="setting-smtp-secure"
                    type="checkbox"
                    checked={smtpSecure}
                    onChange={(e) => setSmtpSecure(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 bg-[#0a0b10] border-white/10 rounded-xs focus:ring-0 cursor-pointer"
                  />
                  <span className="text-xs text-gray-300">Enforce TLS security transport wrappers</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "theme" && (
          <div className="space-y-6">
            <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider border-b border-white/5 pb-2.5">
              Visual Panel Theme Selection
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Deep charcoal dark theme */}
              <div
                onClick={() => setActiveTheme("dark")}
                className={`p-4 rounded-xl border cursor-pointer flex flex-col gap-3 transition-all select-none ${
                  activeTheme === "dark"
                    ? "bg-indigo-600/10 border-indigo-550 shadow-md shadow-indigo-600/5 text-indigo-300"
                    : "bg-[#0a0b10] border-white/5 hover:border-white/10 text-gray-400"
                }`}
              >
                <span className="text-xs font-bold uppercase tracking-wider block">Charcoal Dark</span>
                <div className="flex-1 h-24 bg-[#0d0e12] border border-white/5 p-2 rounded-lg flex flex-col gap-1.5">
                  <div className="w-full h-3 bg-[#11121d] rounded-xs border border-white/5" />
                  <div className="flex-1 rounded bg-[#13141f] border border-white/5 flex gap-1.5 p-1">
                    <div className="w-1.5 h-full bg-[#0b0c10] rounded-xs" />
                    <div className="flex-1 bg-black/40 rounded-sm" />
                  </div>
                </div>
                <span className="text-[10px] text-gray-500 block">Default dark high contrast canvas</span>
              </div>

              {/* Midnight blue layout */}
              <div
                onClick={() => setActiveTheme("midnight")}
                className={`p-4 rounded-xl border cursor-pointer flex flex-col gap-3 transition-all select-none ${
                  activeTheme === "midnight"
                    ? "bg-indigo-600/10 border-indigo-550 shadow-md shadow-indigo-600/5 text-indigo-300"
                    : "bg-[#0a0b10] border-white/5 hover:border-white/10 text-gray-400"
                }`}
              >
                <span className="text-xs font-bold uppercase tracking-wider block">Ocean Midnight</span>
                <div className="flex-1 h-24 bg-[#050b18] border border-white/5 p-2 rounded-lg flex flex-col gap-1.5">
                  <div className="w-full h-3 bg-[#0a122c] rounded-xs border border-white/5" />
                  <div className="flex-1 rounded bg-[#0d1c3f] border border-white/5 flex gap-1.5 p-1">
                    <div className="w-1.5 h-full bg-[#030712] rounded-xs" />
                    <div className="flex-1 bg-black/45 rounded-sm" />
                  </div>
                </div>
                <span className="text-[10px] text-gray-500 block">Dark sapphire marine gradients</span>
              </div>

              {/* Cosmic black layout */}
              <div
                onClick={() => setActiveTheme("cosmic")}
                className={`p-4 rounded-xl border cursor-pointer flex flex-col gap-3 transition-all select-none ${
                  activeTheme === "cosmic"
                    ? "bg-indigo-600/10 border-indigo-550 shadow-md shadow-indigo-600/5 text-indigo-300"
                    : "bg-[#0a0b10] border-white/5 hover:border-white/10 text-gray-400"
                }`}
              >
                <span className="text-xs font-bold uppercase tracking-wider block">Cosmic Deep Void</span>
                <div className="flex-1 h-24 bg-[#030303] border border-white/5 p-2 rounded-lg flex flex-col gap-1.5">
                  <div className="w-full h-3 bg-[#0c0c0c] rounded-xs border border-white/5" />
                  <div className="flex-1 rounded bg-[#121212] border border-white/5 flex gap-1.5 p-1">
                    <div className="w-1.5 h-full bg-[#000000] rounded-xs" />
                    <div className="flex-1 bg-black/50 rounded-sm" />
                  </div>
                </div>
                <span className="text-[10px] text-gray-500 block">Pure flat absolute background black</span>
              </div>
            </div>
          </div>
        )}

        {/* Global configuration Save button */}
        <div className="pt-6 border-t border-white/5 mt-6 flex justify-end">
          <button
            id="setting-save-all"
            type="submit"
            className="px-5 py-2.5 bg-indigo-650 hover:bg-indigo-550 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-[0_4px_15px_rgba(79,70,229,0.3)] transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Commit Configuration Settings
          </button>
        </div>
      </form>
    </div>
  );
}
