/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { History, Shield, Globe, Terminal, RefreshCw, Layers } from "lucide-react";
import { AuditLog } from "../types";

interface AdminAuditLogsProps {
  logs: AuditLog[];
}

export default function AdminAuditLogs({ logs }: AdminAuditLogsProps) {
  const [filter, setFilter] = useState("ALL");

  const getLogBadge = (action: string) => {
    switch (action) {
      case "INSTANCE_CREATED":
        return <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 px-2 py-0.5 rounded font-bold uppercase">CREATED</span>;
      case "SECURITY_CREDENTIALS_CHANGED":
        return <span className="text-[9px] font-mono bg-indigo-505/10 text-indigo-400 border border-indigo-505/20 px-2 py-0.5 rounded font-bold uppercase">SECURITY</span>;
      case "NODE_TAGS_UPDATED":
        return <span className="text-[9px] font-mono bg-amber-500/10 text-amber-450 border border-amber-500/20 px-2 py-0.5 rounded font-bold uppercase">TAGGING</span>;
      default:
        return <span className="text-[9px] font-mono bg-neutral-800 text-neutral-350 border border-white/5 px-2 py-0.5 rounded font-bold uppercase">EXTENSION</span>;
    }
  };

  const filteredLogs = filter === "ALL" ? logs : logs.filter((l) => l.action === filter);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex justify-between items-center bg-[#11121d] p-5 rounded-xl border border-white/5 shadow-xs">
        <div>
          <h2 className="text-xl font-display font-medium text-white tracking-tight">
            Security audit log rosters
          </h2>
          <p className="text-xs text-gray-400 font-sans">
            Review detailed physical machine overrides, game provisions, password adjustments, and network triggers.
          </p>
        </div>

        {/* Filters */}
        <select
          id="log-action-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-neutral-800 hover:bg-neutral-750 text-gray-300 rounded-lg text-xs font-semibold py-1.5 px-3 focus:outline-hidden border border-white/5 cursor-pointer"
        >
          <option value="ALL">All Actions Index</option>
          <option value="INSTANCE_CREATED">Provisions</option>
          <option value="SECURITY_CREDENTIALS_CHANGED">Security</option>
          <option value="NODE_TAGS_UPDATED">Tags Updates</option>
        </select>
      </div>

      <div className="bg-[#11121d] rounded-xl border border-white/5 overflow-hidden shadow-inner">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs select-none">
            <thead>
              <tr className="bg-[#0b0c10] border-b border-white/5 text-gray-400 font-mono">
                <th className="px-5 py-3 font-semibold uppercase tracking-wider">Classification</th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wider">Identity Profile</th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wider">IP Address</th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wider">Action Parameters Meta</th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wider text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/4 font-sans text-gray-300">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-5 py-3.5 italic">
                    {getLogBadge(log.action)}
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-gray-200">
                    <span className="block">{log.username}</span>
                    <span className="text-[10px] text-gray-500 font-mono">ID: {log.userId}</span>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-gray-450">
                    <Globe className="w-3.5 h-3.5 text-gray-500 inline mr-1" /> {log.ipAddress}
                  </td>
                  <td className="px-5 py-3.5 font-sans leading-relaxed text-gray-300 max-w-sm">
                    {log.details}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-gray-500 text-right">
                    {log.timestamp.replace("T", " ").replace("Z", "")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
