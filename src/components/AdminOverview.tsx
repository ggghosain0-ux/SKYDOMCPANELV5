/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Users, Cpu, HardDrive, Layers, Terminal, ArrowUpRight, ShieldAlert, CheckCircle2 } from "lucide-react";
import { SystemUser, GameInstance, PhysicalNode, DockerImage } from "../types";

interface AdminOverviewProps {
  users: SystemUser[];
  instances: GameInstance[];
  nodes: PhysicalNode[];
  images: DockerImage[];
  onNavigate: (view: string) => void;
}

export default function AdminOverview({
  users,
  instances,
  nodes,
  images,
  onNavigate,
}: AdminOverviewProps) {
  // Dynamic metrics aligned with internal mocked data state
  const totalUsers = users.length;
  const totalInstances = instances.length;
  const totalNodes = nodes.length;
  const totalImages = images.length;

  const versionLogs = [
    { version: "v4.1.2-beta-stable", date: "2026-05-20", changes: "Bound Docker sandbox container memory allocation overrides" },
    { version: "v4.1.0-release", date: "2026-05-02", changes: "Implemented raw xterm pipeline streams socket daemon mapping" },
    { version: "v4.0.8-patch", date: "25-04-2026", changes: "Mitigated thread crashes in Texas and Dallas clustering nodes" },
    { version: "v4.0.0-core", date: "2026-02-14", changes: "Skyport Alt Framework redesign from legacy standard backbones" },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-display font-medium text-white tracking-tight">
          System Overview & Core Analytics
        </h2>
        <p className="text-xs text-[#9ca3af] font-sans mt-1">
          Real-time metrics tracking on active nodes, virtual docker machines, execution images, and daemon clusters.
        </p>
      </div>

      {/* CORE VERSION INFO ALERT ELEMENT (Rigid Layout Specification) */}
      <div className="bg-[#10b981]/5 border border-[#10b981]/30 p-4 rounded-xl flex items-start gap-3 shadow-[0_4px_20px_rgba(16,185,129,0.05)]">
        <CheckCircle2 className="w-5 h-5 text-[#10b981] shrink-0 mt-0.5 animate-pulse" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Skyport Core Controller Matrix
          </h4>
          <p className="text-xs text-[#9ca3af] font-sans leading-relaxed">
            The daemon and physical hosts are executing correctly. Backplane linked successfully. Panel Version: <span className="font-mono text-white bg-[#1e212b] px-1.5 py-0.5 rounded text-[10px] font-bold">v4.1.2-beta-stable</span>
          </p>
        </div>
      </div>

      {/* Grid Counters in Bento Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Users counter block */}
        <div
          id="overview-bento-users"
          onClick={() => onNavigate("admin_users")}
          className="bg-[#15171e] hover:bg-[#1e212b] p-5 rounded-2xl border border-white/5 flex items-center justify-between transition-all duration-250 cursor-pointer shadow-xs group"
        >
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest block">
              Global Users
            </span>
            <span className="text-2xl font-mono text-white font-semibold block">
              {totalUsers}
            </span>
            <span className="text-[10px] text-[#10b981] flex items-center gap-1 font-semibold">
              Roster Accounts <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5" />
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#1e212b] flex items-center justify-center text-[#10b981] group-hover:bg-[#10b981]/10">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Instances counter block */}
        <div
          id="overview-bento-instances"
          onClick={() => onNavigate("admin_instances")}
          className="bg-[#15171e] hover:bg-[#1e212b] p-5 rounded-2xl border border-white/5 flex items-center justify-between transition-all duration-250 cursor-pointer shadow-xs group"
        >
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest block">
              Active Instances
            </span>
            <span className="text-2xl font-mono text-white font-semibold block">
              {totalInstances}
            </span>
            <span className="text-[10px] text-zinc-550 text-[#9ca3af]/80 flex items-center gap-1">
              Virtual machines <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5" />
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#1e212b] flex items-center justify-center text-[#10b981] group-hover:bg-[#10b981]/10">
            <Cpu className="w-5 h-5" />
          </div>
        </div>

        {/* Nodes counter block */}
        <div
          id="overview-bento-nodes"
          onClick={() => onNavigate("admin_nodes")}
          className="bg-[#15171e] hover:bg-[#1e212b] p-5 rounded-2xl border border-white/5 flex items-center justify-between transition-all duration-250 cursor-pointer shadow-xs group"
        >
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest block">
              Physical Nodes
            </span>
            <span className="text-2xl font-mono text-white font-semibold block">
              {totalNodes}
            </span>
            <span className="text-[10px] text-zinc-550 text-[#9ca3af]/80 flex items-center gap-1">
              Cluster hardware <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5" />
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#1e212b] flex items-center justify-center text-[#10b981] group-hover:bg-[#10b981]/10">
            <HardDrive className="w-5 h-5" />
          </div>
        </div>

        {/* Docker Images counter block */}
        <div
          id="overview-bento-images"
          onClick={() => onNavigate("admin_images")}
          className="bg-[#15171e] hover:bg-[#1e212b] p-5 rounded-2xl border border-white/5 flex items-center justify-between transition-all duration-250 cursor-pointer shadow-xs group"
        >
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest block">
              System Images
            </span>
            <span className="text-2xl font-mono text-white font-semibold block">
              {totalImages}
            </span>
            <span className="text-[10px] text-[#10b981] flex items-center gap-1 font-semibold">
              Game Packs <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5" />
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#1e212b] flex items-center justify-center text-[#10b981] group-hover:bg-[#10b981]/10">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Fast Linker Guide */}
      <div className="bg-[#15171e] p-6 rounded-2xl border border-white/5 grid grid-cols-1 md:grid-cols-2 gap-6 items-center shadow-xs">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider block">
            Core Daemon Fast Connection Link
          </h3>
          <p className="text-xs text-[#9ca3af] leading-relaxed font-sans">
            Integrate a standalone Linux host machine inside the Skyport cluster network. Boot the lightweight high-security daemon locally, configure daemon sockets, and query stats instantly.
          </p>
          <div className="flex gap-2.5 pt-1">
            <button
              onClick={() => onNavigate("admin_nodes")}
              className="px-4 py-2 bg-[#10b981] hover:bg-[#10b981]/95 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors select-none"
            >
              Add Baremetal Node
            </button>
            <button
              onClick={() => onNavigate("admin_instances")}
              className="px-4 py-2 bg-[#1e212b] hover:bg-neutral-850 text-[#9ca3af] rounded-xl text-xs font-bold cursor-pointer transition-colors select-none border border-white/5"
            >
              Provision Virtual Server
            </button>
          </div>
        </div>
        <div className="bg-[#0c0d12] p-4 rounded-xl border border-white/5 font-mono text-xs text-[#10b981] space-y-1 overflow-x-auto select-all">
          <div>$ curl -sSL https://daemon.skyport.alt/setup.sh | bash</div>
          <div className="text-[#9ca3af]/45"># Connecting secure Docker socket maps...</div>
          <div className="text-white"># Daemon running successfully on [0.0.0.0:8080]</div>
        </div>
      </div>

      {/* Version Control Logs */}
      <div className="bg-[#15171e] p-6 rounded-2xl border border-white/5 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 border-b border-white/5 pb-3">
          <Terminal className="text-[#10b981] w-5 h-5 shrink-0 animate-pulse" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Consolidated Release History
          </h3>
        </div>

        <div className="space-y-3">
          {versionLogs.map((log, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#0d0e12]/60 p-3.5 rounded-xl border border-white/5">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[9px] font-bold text-[#10b981] bg-[#10b981]/10 border border-[#10b981]/25 px-2 py-0.5 rounded uppercase">
                  {log.version}
                </span>
                <span className="text-xs text-[#9ca3af] font-sans leading-relaxed">
                  {log.changes}
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#9ca3af]/40">{log.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
