/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from "react";
import { 
  Search, 
  Terminal, 
  Settings, 
  Cpu, 
  HardDrive, 
  Database, 
  Users, 
  Play, 
  Square, 
  RefreshCw, 
  Compass, 
  Sparkles, 
  HelpCircle, 
  CreditCard, 
  Github, 
  MessageSquare, 
  Megaphone, 
  X, 
  LayoutGrid, 
  Eye,
  Sliders,
  Copy,
  Check
} from "lucide-react";
import { GameInstance, InstanceStatus } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface ClientServersListProps {
  instances: GameInstance[];
  onSelect: (instance: GameInstance) => void;
  onStatusChange: (instanceId: string, status: InstanceStatus) => void;
}

export default function ClientServersList({
  instances,
  onSelect,
  onStatusChange
}: ClientServersListProps) {
  // Toggle between skins: "wisp" (Slate Grid from Photo 2) or "nebula" (Minecraft Immersive from Photo 1)
  const [activeSkin, setActiveSkin] = useState<"wisp" | "nebula">("wisp");
  
  // Search and categorization states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "running" | "stopped">("all");
  const [nebulaShowOthers, setNebulaShowOthers] = useState(true);
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Dynamic live metrics simulation state for realistic telemetry update drift
  const [liveMetrics, setLiveMetrics] = useState<Record<string, { cpu: number; ram: number; disk: number }>>({});

  useEffect(() => {
    const initMetrics: Record<string, { cpu: number; ram: number; disk: number }> = {};
    instances.forEach((inst) => {
      initMetrics[inst.id] = {
        cpu: inst.status === "running" ? (inst.cpuUsagePercent || (5 + Math.random() * 20)) : 0,
        ram: inst.status === "running" ? (inst.memoryAllocMB || (inst.memoryLimitMB * 0.35)) : 0,
        disk: inst.status === "running" ? (inst.diskUsageGB || (inst.diskLimitGB * 0.28)) : 0,
      };
    });
    setLiveMetrics(initMetrics);

    const interval = setInterval(() => {
      setLiveMetrics((prev) => {
        const next = { ...prev };
        instances.forEach((inst) => {
          if (inst.status === "running") {
            const current = prev[inst.id] || { cpu: 15, ram: inst.memoryLimitMB * 0.3, disk: inst.diskLimitGB * 0.25 };
            const cpuDrift = (Math.random() - 0.5) * 5;
            const ramDrift = (Math.random() - 0.5) * 20;
            const diskDrift = (Math.random() - 0.5) * 1;

            next[inst.id] = {
              cpu: Math.max(0.5, Math.min(inst.cpuLimitPercent, current.cpu + cpuDrift)),
              ram: Math.max(inst.memoryLimitMB * 0.1, Math.min(inst.memoryLimitMB, current.ram + ramDrift)),
              disk: Math.max(0.1, Math.min(inst.diskLimitGB, current.disk + diskDrift))
            };
          } else if (inst.status === "starting") {
            next[inst.id] = {
              cpu: 70 + Math.random() * 15,
              ram: inst.memoryLimitMB * 0.4,
              disk: inst.diskLimitGB * 0.15
            };
          } else {
            next[inst.id] = { cpu: 0, ram: 0, disk: 0 };
          }
        });
        return next;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [instances]);

  // Copy Connection IP handler
  const handleCopyIp = (e: React.MouseEvent, ipPort: string, instId: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(ipPort);
    setCopiedId(instId);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Filter instances lists accurately based on skins and preferences
  const filteredInstances = useMemo(() => {
    return instances.filter((inst) => {
      const matchesSearch = 
        (inst.name && inst.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (inst.ip && inst.ip.includes(searchQuery)) ||
        (inst.id && inst.id.includes(searchQuery)) ||
        (inst.categoryName && inst.categoryName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (inst.eggName && inst.eggName.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesStatus = 
        statusFilter === "all" ? true :
        statusFilter === "running" ? (inst.status === "running" || inst.status === "starting") :
        (inst.status === "stopped" || inst.status === "stopping");

      // Nebula conditional: showing others' servers toggle
      const matchesOwner = activeSkin === "nebula" && !nebulaShowOthers 
        ? inst.ownerId === "6d0370" 
        : true;

      return matchesSearch && matchesStatus && matchesOwner;
    });
  }, [instances, searchQuery, statusFilter, nebulaShowOthers, activeSkin]);

  // Helper formattings
  const formatMBtoGB = (mb: number) => (mb / 1024).toFixed(1);
  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-emerald-500";
      case "starting":
        return "bg-amber-400";
      case "stopping":
        return "bg-amber-500";
      default:
        return "bg-rose-500";
    }
  };

  return (
    <div className="space-y-6 relative select-none">
      {/* Dynamic Skin Selection HUD Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#11121d] border border-white/5 p-3 rounded-2xl">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400 font-bold animate-pulse" />
          <span className="text-xs font-semibold text-gray-200">Select Interface Skin:</span>
        </div>
        
        <div className="flex gap-1.5 bg-[#0a0a0f] p-1 rounded-xl border border-white/5">
          <button
            id="skin-toggle-wisp"
            onClick={() => setActiveSkin("wisp")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSkin === "wisp" 
                ? "bg-indigo-650 text-white shadow-xs" 
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" /> Photo 2 Desk Grid (Wisp)
          </button>
          <button
            id="skin-toggle-nebula"
            onClick={() => setActiveSkin("nebula")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSkin === "nebula" 
                ? "bg-rose-500 text-white shadow-xs" 
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Compass className="w-3.5 h-3.5" /> Photo 1 Nebula Immersive
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeSkin === "wisp" ? (
          /* ==============================================
             SKIN A: WISP / GHOSTCAP GLASS GRID (Photo 2)
             ============================================== */
          <motion.div
            key="wisp-skin"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Header section with double block circular icon */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 select-none">
                <div className="w-6 h-6 flex flex-col justify-between items-center gap-[3px]">
                  <div className="w-6 h-[8px] rounded bg-emerald-500/80" />
                  <div className="w-6 h-[8px] rounded bg-emerald-500/80" />
                </div>
              </div>
              <div className="text-left">
                <h1 className="text-3xl font-black font-display text-white tracking-tight">My Servers</h1>
                <p className="text-sm text-gray-400">Game servers you have access to.</p>
              </div>
            </div>

            {/* Glowing Deep Indigo Glow Search Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                id="wisp-search-input"
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#11121d]/85 text-gray-200 pl-12 pr-4 py-3.5 rounded-xl border border-indigo-700/30 focus:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500/50 transition-all font-sans text-sm tracking-wide shadow-inner placeholder-gray-500"
              />
            </div>

            {/* Grid of highly authentic game servers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {filteredInstances.map((inst) => {
                const metrics = liveMetrics[inst.id] || { cpu: 0, ram: 0, disk: 0 };
                const cpuStr = inst.status === "running" ? `${metrics.cpu.toFixed(2)} %` : "-- %";
                
                const ramCurrentStr = inst.status === "running" 
                  ? (metrics.ram < 1024 ? `${metrics.ram.toFixed(1)} MB` : `${(metrics.ram / 1024).toFixed(1)} GB`)
                  : "--";
                const ramLimitStr = formatMBtoGB(inst.memoryLimitMB);

                const diskCurrentStr = inst.status === "running" ? `${metrics.disk.toFixed(1)} GB` : "--";
                const diskLimitStr = inst.diskLimitGB;

                return (
                  <div
                    id={`wisp-card-${inst.id}`}
                    key={inst.id}
                    onClick={() => onSelect(inst)}
                    className="group relative rounded-2xl bg-[#11121d]/90 border border-white/5 overflow-hidden transition-all duration-300 hover:border-indigo-500/30 hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)] flex flex-col justify-between cursor-pointer"
                  >
                    {/* Game themed backdrop picture - faded and darkened */}
                    <div 
                      className="absolute inset-0 bg-cover bg-center opacity-[0.09] transition-all duration-700 group-hover:scale-105 pointer-events-none"
                      style={{ backgroundImage: `url(${inst.bgImageUrl})` }}
                    />
                    
                    {/* Linear dark gradient to protect contrast for readable text */}
                    <div className="absolute inset-0 bg-linear-to-b from-transparent via-[#11121d]/50 to-[#11121d] pointer-events-none" />

                    {/* Left & Right Main Card Interior Row */}
                    <div className="relative p-6 flex justify-between items-start gap-4 z-10">
                      
                      <div className="space-y-1.5 text-left">
                        {/* Status row along with server label & code */}
                        <div className="flex items-center flex-wrap gap-2.5">
                          <span className={`w-3 h-3 rounded-full ${getStatusColor(inst.status)} shrink-0 relative flex`}>
                            {inst.status === "running" && (
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                            )}
                          </span>
                          <h3 className="text-[17px] font-bold text-white tracking-tight group-hover:text-indigo-400 transition-colors">
                            {inst.name}
                          </h3>
                          <span className="text-[10px] font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded-md leading-relaxed uppercase">
                            {inst.id}
                          </span>
                        </div>

                        {/* Location address node details */}
                        <div className="text-xs text-gray-400 font-sans tracking-wide">
                          {inst.ip}:{inst.port} <span className="text-gray-500 px-1">on</span> <span className="text-gray-300 font-mono font-bold">{inst.nodeName}</span>
                        </div>
                      </div>

                      {/* Right aligned custom action quick buttons icons */}
                      <div className="flex items-center gap-2 shrink-0 select-none">
                        <button
                          id={`btn-wisp-console-${inst.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelect(inst);
                          }}
                          className="w-9 h-9 items-center justify-center flex rounded-xl border border-white/5 text-gray-400 hover:text-emerald-400 hover:border-emerald-500/20 hover:bg-emerald-500/10 transition-colors pointer-events-auto cursor-pointer shadow-xs bg-black/20"
                          title="Open Console Screen"
                        >
                          <Terminal className="w-4 h-4" />
                        </button>
                        <button
                          id={`btn-wisp-settings-${inst.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelect(inst);
                          }}
                          className="w-9 h-9 items-center justify-center flex rounded-xl border border-white/5 text-gray-400 hover:text-indigo-400 hover:border-indigo-500/20 hover:bg-indigo-500/10 transition-colors pointer-events-auto cursor-pointer shadow-xs bg-black/20"
                          title="Configure Environment Instance"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Stats metrics panel spanning horizontal base inside card border box */}
                    <div className="relative border-t border-white/5 bg-[#0e0f18]/90 p-4 grid grid-cols-4 gap-2 z-10">
                      {/* Cpu Usage Column */}
                      <div className="text-left space-y-1">
                        <div className="text-[10px] font-mono text-gray-500 flex items-center gap-1.5">
                          <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                          CPU
                        </div>
                        <div className="text-xs font-semibold text-gray-200">
                          {cpuStr}
                        </div>
                      </div>

                      {/* RAM Memory Column */}
                      <div className="text-left space-y-1 col-span-1">
                        <div className="text-[10px] font-mono text-gray-500 flex items-center gap-1.5">
                          <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
                          MEMORY
                        </div>
                        <div className="text-xs font-semibold text-gray-200 truncate">
                          {inst.status === "running" ? `${ramCurrentStr} / ` : "-- / "} {ramLimitStr} GB
                        </div>
                      </div>

                      {/* Storage Disk Column */}
                      <div className="text-left space-y-1 col-span-1">
                        <div className="text-[10px] font-mono text-gray-500 flex items-center gap-1.5">
                          <Database className="w-3.5 h-3.5 text-indigo-400" />
                          DISK
                        </div>
                        <div className="text-xs font-semibold text-gray-200 text-ellipsis overflow-hidden">
                          {inst.status === "running" ? `${diskCurrentStr} / ` : "-- / "} {diskLimitStr} GB
                        </div>
                      </div>

                      {/* Player Counter Info Column */}
                      <div className="text-left space-y-1">
                        <div className="text-[10px] font-mono text-gray-500 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-indigo-400" />
                          PLAYERS
                        </div>
                        <div className="text-xs font-semibold text-gray-200">
                          {inst.status === "running" && inst.playersCountCurrent !== undefined
                            ? `${inst.playersCountCurrent} / ${inst.playersCountMax}`
                            : "-- / --"}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredInstances.length === 0 && (
              <div className="p-12 text-center text-gray-500 italic bg-[#11121d] border border-white/5 rounded-2xl">
                No active games found matching search filters.
              </div>
            )}
          </motion.div>
        ) : (
          /* ==============================================
             SKIN B: NEBULA IMMERSIVE VIBES (Photo 1)
             ============================================== */
          <motion.div
            key="nebula-skin"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-6 relative rounded-3xl overflow-hidden border border-white/10 p-6"
            style={{
              backgroundImage: `linear-gradient(to bottom, rgba(13, 14, 18, 0.88), rgba(13, 14, 18, 0.96)), url("https://images.unsplash.com/photo-1607988795691-3d0147b43231?w=1200&auto=format&fit=crop&q=80")`,
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}
          >
            {/* Ambient overlay blur layer */}
            <div className="absolute inset-0 bg-[#0d0e12]/50 backdrop-blur-xs pointer-events-none rounded-3xl" />

            {/* Quick Support Action Bar on top right layout */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 select-none">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse" />
                <span className="text-sm font-semibold tracking-wide uppercase text-white font-display">NEBULA SYSTEMS LIVE</span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <a href="#support" className="px-4 py-2 bg-indigo-500/10 hover:bg-rose-500/20 border border-rose-500/15 text-rose-300 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer">
                  <HelpCircle className="w-3.5 h-3.5" /> Support
                </a>
                <a href="#billing" className="px-4 py-2 bg-indigo-500/10 hover:bg-rose-500/20 border border-rose-500/15 text-rose-300 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer">
                  <CreditCard className="w-3.5 h-3.5" /> Billing
                </a>
                <a href="https://github.com" target="_blank" rel="noreferrer" className="px-4 py-2 bg-indigo-500/10 hover:bg-rose-500/20 border border-rose-500/15 text-rose-300 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer">
                  <Github className="w-3.5 h-3.5" /> GitHub
                </a>
                <a href="https://discord.com" target="_blank" rel="noreferrer" className="px-4 py-2 bg-indigo-500/10 hover:bg-rose-500/20 border border-rose-500/15 text-rose-300 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer">
                  <MessageSquare className="w-3.5 h-3.5" /> Discord
                </a>
              </div>
            </div>

            {/* Megaphone alert ribbon notification panel */}
            {showWelcomeBanner && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="relative z-10 bg-[#16171f]/95 border-l-4 border-rose-500 rounded-xl p-4 flex items-center justify-between gap-4 shadow-xl"
              >
                <div className="flex items-center gap-3 text-left">
                  <Megaphone className="w-5 h-5 text-rose-400 shrink-0 select-none" />
                  <div>
                    <h4 className="text-xs font-bold text-white font-display uppercase tracking-wider">Welcome To My Panel</h4>
                    <p className="text-[11px] text-gray-400 font-sans mt-0.5">Skyport engine metrics are fully loaded. Select an environment below to edit configs.</p>
                  </div>
                </div>

                <button 
                  onClick={() => setShowWelcomeBanner(false)}
                  className="p-1 text-gray-500 hover:text-white transition-colors cursor-pointer"
                  title="Dismiss announcement"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {/* Shows status of others toggle state switch representation */}
            <div className="relative z-10 flex items-center justify-between bg-black/45 border border-white/5 p-3 rounded-xl select-none">
              <span className="text-xs text-gray-300">Showing all clusters & secondary environments?</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-400 font-mono">SHOWING OTHERS' SERVERS</span>
                <button
                  onClick={() => setNebulaShowOthers(!nebulaShowOthers)}
                  className={`w-10 h-6 rounded-full p-0.5 transition-colors cursor-pointer flex items-center ${
                    nebulaShowOthers ? "bg-rose-500" : "bg-neutral-800"
                  }`}
                  title="Toggle others servers listing representation"
                >
                  <span className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    nebulaShowOthers ? "translate-x-4" : "translate-x-0"
                  }`} />
                </button>
              </div>
            </div>

            {/* Immersive Glass Cards Grid block */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredInstances.map((inst) => {
                const metrics = liveMetrics[inst.id] || { cpu: 0, ram: 0, disk: 0 };
                const cpuVal = metrics.cpu;
                
                const memoryVal = inst.status === "running"
                  ? metrics.ram < 1024 ? `${metrics.ram.toFixed(0)} MB` : `${(metrics.ram / 1024).toFixed(2)} GiB`
                  : "--";
                
                const diskVal = inst.status === "running"
                  ? metrics.disk < 1
                    ? `${(metrics.disk * 1024).toFixed(1)} MiB`
                    : `${metrics.disk.toFixed(1)} GB`
                  : "--";

                return (
                  <div
                    key={inst.id}
                    className="relative group rounded-2xl bg-[#11121d]/85 border-t-2 border-rose-500 p-5 backdrop-blur-md hover:scale-[1.01] hover:bg-[#11121d]/95 transition-all text-left flex flex-col justify-between h-64 border border-white/5"
                  >
                    <div className="space-y-4">
                      {/* Name along category row icons */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <span className="text-[9px] font-mono uppercase text-rose-450 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/15">
                            {inst.categoryName || "Game Server"}
                          </span>
                          <h3 className="text-base font-bold text-white tracking-tight mt-1 truncate max-w-[180px]">
                            {inst.name}
                          </h3>
                        </div>

                        {/* Styled mini status led */}
                        <div className="flex items-center gap-1.5 bg-black/40 p-1.5 rounded-lg border border-white/5 shrink-0">
                          <span className={`w-2.5 h-2.5 rounded-full ${getStatusColor(inst.status)}`} />
                          <span className="text-[9px] font-mono uppercase font-bold text-gray-300">{inst.status}</span>
                        </div>
                      </div>

                      {/* Translucent quick stats columns */}
                      <div className="grid grid-cols-3 gap-1.5">
                        {/* CPU Stat */}
                        <div className="bg-black/50 backdrop-blur-xs p-2 rounded-lg border border-white/5 flex flex-col items-center justify-center space-y-0.5">
                          <Cpu className="w-3.5 h-3.5 text-rose-400" />
                          <span className="text-[10px] font-mono font-semibold text-gray-200">
                            {inst.status === "running" ? `${cpuVal.toFixed(2)} %` : "0.00 %"}
                          </span>
                        </div>

                        {/* MEMORY Stat */}
                        <div className="bg-black/50 backdrop-blur-xs p-2 rounded-lg border border-white/5 flex flex-col items-center justify-center space-y-0.5">
                          <HardDrive className="w-3.5 h-3.5 text-rose-400" />
                          <span className="text-[10px] font-mono font-semibold text-gray-200 truncate max-w-full">
                            {inst.status === "running" ? memoryVal : "0.00 MiB"}
                          </span>
                        </div>

                        {/* DISK Stat */}
                        <div className="bg-black/50 backdrop-blur-xs p-2 rounded-lg border border-white/5 flex flex-col items-center justify-center space-y-0.5">
                          <Database className="w-3.5 h-3.5 text-rose-400" />
                          <span className="text-[10px] font-mono font-semibold text-gray-200 truncate max-w-full">
                            {inst.status === "running" ? diskVal : "0.00 MiB"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Launch Terminal Trigger bottom button */}
                    <div className="pt-4 border-t border-white/5">
                      <button
                        id={`btn-nebula-launch-${inst.id}`}
                        onClick={() => onSelect(inst)}
                        className="w-full py-2 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-450 hover:to-rose-550 text-white font-bold text-xs rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider font-display font-black"
                      >
                        <Terminal className="w-3.5 h-3.5" /> Launch Terminal
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredInstances.length === 0 && (
              <div className="p-12 text-center text-gray-400 italic bg-black/40 rounded-3xl relative z-10 border border-white/5">
                No environments discovered.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
