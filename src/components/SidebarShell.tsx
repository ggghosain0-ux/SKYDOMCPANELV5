/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  Server,
  User,
  LayoutDashboard,
  Sliders,
  BarChart3,
  Users,
  Layers,
  HardDrive,
  Package,
  Key,
  ShieldAlert,
  Puzzle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Menu,
  X
} from "lucide-react";
import { SystemUser, PanelSettings } from "../types";

export type NavItemKey =
  | "client_instances"
  | "client_account"
  | "admin_overview"
  | "admin_settings"
  | "admin_analytics"
  | "admin_users"
  | "admin_instances"
  | "admin_nodes"
  | "admin_images"
  | "admin_api_keys"
  | "admin_audit_logs"
  | "admin_plugins";

interface SidebarShellProps {
  currentUser: SystemUser;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  activeView: string;
  onNavigate: (view: string) => void;
  onSignOut: () => void;
  mobileOpen?: boolean;
  setMobileOpen?: (v: boolean) => void;
  settings?: PanelSettings;
}

export default function SidebarShell({
  currentUser,
  collapsed,
  setCollapsed,
  activeView,
  onNavigate,
  onSignOut,
  mobileOpen = false,
  setMobileOpen,
  settings
}: SidebarShellProps) {
  const [modalContent, setModalContent] = React.useState<{ title: string; message: string; type: 'security' | 'guide' } | null>(null);

  const isActive = (viewKey: string) => {
    if (viewKey === "client_instances") {
      return activeView === "client_instances" || activeView.startsWith("instance_console");
    }
    return activeView === viewKey;
  };

  const navClass = (viewKey: string) => {
    const active = isActive(viewKey);
    return `w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all text-left cursor-pointer font-sans select-none ${
      active
        ? "bg-[#1e212b] text-[#ffffff] font-semibold pl-3 border-r-2 border-emerald-400"
        : "text-[#9ca3af] hover:text-[#ffffff] hover:bg-[#1e212b]/60"
    }`;
  };

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-[#0d0e12]/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileOpen?.(false)}
        />
      )}

      <aside
        className={`bg-[#0a0b10] border-r border-[#1e212b]/40 flex flex-col transition-all duration-300 z-45 select-none 
          fixed inset-y-0 left-0 transform md:relative md:translate-x-0
          ${mobileOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0"}
          ${collapsed ? "md:w-16" : "md:w-64"}
        `}
      >
        {/* Top styling panel element: Circular stylized letter logo inside slate circle */}
        {!collapsed || mobileOpen ? (
          <div className="p-4 pt-5 pb-2 flex items-center gap-3">
            {settings?.logoUrl ? (
              <img
                src={settings.logoUrl || undefined}
                alt="Brand Logo"
                className="w-9 h-9 rounded-xl object-cover shrink-0 select-none"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-indigo-650 flex items-center justify-center text-white font-black font-display text-xl select-none shadow-[0_4px_12px_rgba(79,70,229,0.3)] shrink-0">
                {(settings?.panelName?.[0] || "S").toUpperCase()}
              </div>
            )}
            <div className="flex flex-col text-left overflow-hidden">
              <span className="text-xs font-black uppercase text-white font-display tracking-widest leading-none truncate max-w-[140px]">
                {settings?.panelName || "SKYSHELL"}
              </span>
              <span className="text-[9px] text-[#9ca3af] mt-0.5 uppercase tracking-tighter">CLOUD INSTANCE</span>
            </div>
          </div>
        ) : (
          <div className="p-4 pt-5 pb-2 flex justify-center">
            {settings?.logoUrl ? (
              <img
                src={settings.logoUrl || undefined}
                alt="Brand Logo"
                className="w-9 h-9 rounded-xl object-cover select-none"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-indigo-650 flex items-center justify-center text-white font-black font-display text-xl select-none">
                {(settings?.panelName?.[0] || "S").toUpperCase()}
              </div>
            )}
          </div>
        )}

        {/* 2. User Profile Header Box (Rigid layout specifications) */}
        <div className={`p-4 border-b border-[#1e212b]/30 flex items-center justify-between transition-all overflow-hidden ${collapsed ? "md:justify-center" : ""}`}>
          {(!collapsed || mobileOpen) ? (
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={currentUser.avatarUrl || undefined}
                  alt="root"
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-xl object-cover ring-2 ring-[#10b981]/15"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#10b981] border-2 border-[#15171e] rounded-full" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold text-[#ffffff] truncate max-w-[120px] flex items-center gap-1 leading-none">
                  root
                  <ShieldCheck className="w-3.5 h-3.5 text-[#10b981] shrink-0" title="Admin Root Verified" />
                </span>
                <span className="font-mono text-[9px] text-[#9ca3af] mt-0.5 uppercase tracking-tight select-all">
                  6d0370
                </span>
              </div>
            </div>
          ) : (
            <div className="relative">
              <img
                src={currentUser.avatarUrl || undefined}
                alt="root"
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-xl object-cover ring-1 ring-white/10"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#10b981] border-2 border-[#15171e] rounded-full" />
            </div>
          )}

          {/* Sidebar collapses triggers */}
          <button
            id="sidebar-toggle-btn"
            onClick={() => {
              if (setMobileOpen && mobileOpen) {
                setMobileOpen(false);
              } else {
                setCollapsed(!collapsed);
              }
            }}
            className="p-1.5 rounded-lg hover:bg-[#1e212b] text-[#9ca3af] hover:text-white transition-colors cursor-pointer"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {mobileOpen ? (
              <X className="w-4 h-4 md:hidden" />
            ) : collapsed ? (
              <ChevronRight className="w-4 h-4 hidden md:block" />
            ) : (
              <ChevronLeft className="w-4 h-4 hidden md:block" />
            )}
          </button>
        </div>

        {/* Navigation structure with exact categorizations */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
          {/* Main Category */}
          <div className="space-y-1.5">
            {(!collapsed || mobileOpen) && (
              <div className="px-3 text-[9px] font-mono font-bold text-[#9ca3af]/40 tracking-wider uppercase text-left">
                Main Console
              </div>
            )}
            <nav className="space-y-1">
              <button
                id="nav-instances"
                onClick={() => {
                  onNavigate("client_instances");
                  setMobileOpen?.(false);
                }}
                className={navClass("client_instances")}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Server className={`w-4 h-4 shrink-0 ${isActive("client_instances") ? "text-emerald-400" : "text-gray-400"}`} />
                  {(!collapsed || mobileOpen) && <span className="truncate">My Servers</span>}
                </div>
                {isActive("client_instances") && (!collapsed || mobileOpen) && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 ml-1" />
                )}
              </button>

              <button
                id="nav-account"
                onClick={() => {
                  onNavigate("client_account");
                  setMobileOpen?.(false);
                }}
                className={navClass("client_account")}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <User className={`w-4 h-4 shrink-0 ${isActive("client_account") ? "text-emerald-400" : "text-gray-400"}`} />
                  {(!collapsed || mobileOpen) && <span className="truncate">Account Settings</span>}
                </div>
                {isActive("client_account") && (!collapsed || mobileOpen) && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 ml-1" />
                )}
              </button>

              {/* Security Controls (Photo 2 decoration) */}
              <button
                id="nav-security-dummy"
                onClick={() => {
                  setModalContent({
                    title: "Security Controls Panel",
                    message: "Two-Factor Identification (2FA), firewall cluster filters, and active API gateway tokens are configured through Account Settings.",
                    type: "security"
                  });
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs text-[#9ca3af] hover:text-[#ffffff] hover:bg-[#1e212b]/60 transition-all text-left cursor-pointer font-sans select-none"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-gray-400" />
                  {(!collapsed || mobileOpen) && <span className="truncate">Security Controls</span>}
                </div>
              </button>

              {/* Guides / Documentation (Photo 2 decoration) */}
              <button
                id="nav-guides-dummy"
                onClick={() => {
                  setModalContent({
                    title: "Guides & Tutorials Wiki",
                    message: "Learn how to manage SSH protocols, egg file extensions, Pterodactyl daemon controls, and SFTP allocations in our online cluster wiki.",
                    type: "guide"
                  });
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs text-[#9ca3af] hover:text-[#ffffff] hover:bg-[#1e212b]/60 transition-all text-left cursor-pointer font-sans select-none"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Puzzle className="w-4 h-4 shrink-0 text-gray-400" />
                  {(!collapsed || mobileOpen) && <span className="truncate">Guides / Wiki</span>}
                </div>
              </button>
            </nav>
          </div>

          {/* Admin Panel Section */}
          <div className="space-y-2">
            {(!collapsed || mobileOpen) && (
              <div className="px-3 text-[9px] font-mono font-bold text-[#9ca3af]/30 tracking-wider lowercase">
                admin panel
              </div>
            )}
            <nav className="space-y-1">
              {/* Overview */}
              <button
                id="nav-admin-overview"
                onClick={() => {
                  onNavigate("admin_overview");
                  setMobileOpen?.(false);
                }}
                className={navClass("admin_overview")}
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                {(!collapsed || mobileOpen) && <span className="truncate">Overview</span>}
              </button>

              {/* Settings */}
              <button
                id="nav-admin-settings"
                onClick={() => {
                  onNavigate("admin_settings");
                  setMobileOpen?.(false);
                }}
                className={navClass("admin_settings")}
              >
                <Sliders className="w-4 h-4 shrink-0" />
                {(!collapsed || mobileOpen) && <span className="truncate">Settings</span>}
              </button>

              {/* Analytics */}
              <button
                id="nav-admin-analytics"
                onClick={() => {
                  onNavigate("admin_analytics");
                  setMobileOpen?.(false);
                }}
                className={navClass("admin_analytics")}
              >
                <BarChart3 className="w-4 h-4 shrink-0" />
                {(!collapsed || mobileOpen) && <span className="truncate">Analytics</span>}
              </button>

              {/* Users */}
              <button
                id="nav-admin-users"
                onClick={() => {
                  onNavigate("admin_users");
                  setMobileOpen?.(false);
                }}
                className={navClass("admin_users")}
              >
                <Users className="w-4 h-4 shrink-0" />
                {(!collapsed || mobileOpen) && <span className="truncate">Users</span>}
              </button>

              {/* Instances (admin) */}
              <button
                id="nav-admin-instances"
                onClick={() => {
                  onNavigate("admin_instances");
                  setMobileOpen?.(false);
                }}
                className={navClass("admin_instances")}
              >
                <Layers className="w-4 h-4 shrink-0" />
                {(!collapsed || mobileOpen) && <span className="truncate">Instances</span>}
              </button>

              {/* Nodes */}
              <button
                id="nav-admin-nodes"
                onClick={() => {
                  onNavigate("admin_nodes");
                  setMobileOpen?.(false);
                }}
                className={navClass("admin_nodes")}
              >
                <HardDrive className="w-4 h-4 shrink-0" />
                {(!collapsed || mobileOpen) && <span className="truncate">Nodes</span>}
              </button>

              {/* Images */}
              <button
                id="nav-admin-images"
                onClick={() => {
                  onNavigate("admin_images");
                  setMobileOpen?.(false);
                }}
                className={navClass("admin_images")}
              >
                <Package className="w-4 h-4 shrink-0" />
                {(!collapsed || mobileOpen) && <span className="truncate">Images</span>}
              </button>

              {/* API Keys */}
              <button
                id="nav-admin-api"
                onClick={() => {
                  onNavigate("admin_api_keys");
                  setMobileOpen?.(false);
                }}
                className={navClass("admin_api_keys")}
              >
                <Key className="w-4 h-4 shrink-0" />
                {(!collapsed || mobileOpen) && <span className="truncate">API Keys</span>}
              </button>

              {/* Audit Logs */}
              <button
                id="nav-admin-logs"
                onClick={() => {
                  onNavigate("admin_audit_logs");
                  setMobileOpen?.(false);
                }}
                className={navClass("admin_audit_logs")}
              >
                <ShieldAlert className="w-4 h-4 shrink-0" />
                {(!collapsed || mobileOpen) && <span className="truncate">Audit Logs</span>}
              </button>

              {/* Plugins */}
              <button
                id="nav-admin-plugins"
                onClick={() => {
                  onNavigate("admin_plugins");
                  setMobileOpen?.(false);
                }}
                className={navClass("admin_plugins")}
              >
                <Puzzle className="w-4 h-4 shrink-0" />
                {(!collapsed || mobileOpen) && <span className="truncate">Plugins</span>}
              </button>
            </nav>
          </div>
        </div>

        {/* Sidebar Footer sign out anchor */}
        <div className="p-3 border-t border-[#1e212b]">
          <button
            id="btn-signout"
            onClick={() => {
              onSignOut();
              setMobileOpen?.(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#ef4444] hover:text-[#ef4444]/90 hover:bg-[#ef4444]/10 text-xs font-semibold cursor-pointer transition-all text-left ${
              collapsed && !mobileOpen ? "justify-center" : ""
            }`}
            title="Sign Out Gateway"
          >
            <LogOut className="w-4 h-4 shrink-0 text-[#ef4444]" />
            {(!collapsed || mobileOpen) && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Modern Dialog/Wiki Modal */}
      {modalContent && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#11121d] border border-white/10 rounded-xl max-w-sm w-full p-5 shadow-2xl relative overflow-hidden font-sans">
            <div className="flex items-start gap-3.5">
              <div className={`p-2.5 rounded-lg shrink-0 ${modalContent.type === "security" ? "bg-amber-400/10 text-amber-400" : "bg-emerald-400/10 text-emerald-400"}`}>
                {modalContent.type === "security" ? (
                  <ShieldCheck className="w-5 h-5" />
                ) : (
                  <Puzzle className="w-5 h-5" />
                )}
              </div>
              <div className="space-y-1.5 min-w-0 flex-1">
                <h3 className="text-white font-bold text-sm leading-none tracking-tight">{modalContent.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{modalContent.message}</p>
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setModalContent(null)}
                className="px-4 py-1.5 bg-[#1e212b] hover:bg-[#1e212b]/80 border border-white/5 hover:border-white/10 text-gray-200 text-[11px] font-mono uppercase font-bold tracking-wider rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
