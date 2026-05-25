/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Key, Plus, Trash2, Eye, Copy, Check, ShieldAlert } from "lucide-react";
import { APIKey } from "../types";

interface AdminAPIKeysProps {
  apiKeys: APIKey[];
  onAddKey: (key: APIKey) => void;
  onDeleteKey: (id: string) => void;
}

export default function AdminAPIKeys({ apiKeys, onAddKey, onDeleteKey }: AdminAPIKeysProps) {
  const [name, setName] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const tokenPart = Math.random().toString(36).substring(2, 14) + Math.random().toString(36).substring(2, 14);
    const mockToken = `aeth_pk_${tokenPart}_6d0370`;

    const newKey: APIKey = {
      id: `api_${Math.random().toString(36).substring(2, 8)}`,
      name: name.trim(),
      key: mockToken,
      permissions: ["Full Administrative Override", "Read Core Telemetry"],
      createdAt: new Date().toISOString(),
      lastUsed: "Never used",
    };

    onAddKey(newKey);
    setGeneratedToken(mockToken);
    setName("");
  };

  const handleCopy = (token: string, keyId: string) => {
    navigator.clipboard.writeText(token);
    setCopiedId(keyId);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#11121d] p-5 rounded-xl border border-white/5 shadow-xs">
        <div>
          <h2 className="text-xl font-display font-medium text-white tracking-tight">
            Security API Token Generators
          </h2>
          <p className="text-xs text-gray-400 font-sans">
            Provision secure administrative access codes to sync third-party billing and cron-scheduler automations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Token creation form */}
        <div className="bg-[#11121d] p-5 rounded-xl border border-white/5 space-y-4 shadow-xs h-fit self-start">
          <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider border-b border-white/5 pb-2.5">
            Generate Programmatic Key
          </h3>

          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block">
                Token Label / Description
              </label>
              <input
                id="api-new-label"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="WHMCS-Server-Provisioner"
                className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-xs text-white focus:outline-hidden focus:border-indigo-500 font-sans"
              />
            </div>

            <button
              id="btn-api-generate"
              type="submit"
              className="w-full py-2 bg-indigo-650 hover:bg-indigo-550 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md select-none"
            >
              <Plus className="w-4 h-4" /> Export Token Access Link
            </button>
          </form>

          {/* Secure caution notice */}
          {generatedToken && (
            <div className="bg-emerald-950/20 border border-emerald-500/25 p-3.5 rounded-lg space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold uppercase">
                <Check className="w-4 h-4" /> Secure Token Exported
              </div>
              <p className="text-[10px] text-gray-300">
                Ensure to archive this credential immediately. It will be hidden permanently once you escape or reload:
              </p>
              <div className="bg-black/45 p-2 rounded border border-white/5 font-mono text-[10px] text-teal-350 break-all select-all flex items-center justify-between">
                <span>{generatedToken}</span>
                <button
                  id="btn-api-generate-copy"
                  onClick={() => handleCopy(generatedToken, "temp")}
                  className="p-1 hover:text-white text-gray-450 ml-2"
                >
                  {copiedId === "temp" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tokens list grid layout */}
        <div className="lg:col-span-2 bg-[#11121d] p-5 rounded-xl border border-white/5 space-y-4 shadow-xs">
          <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider border-b border-white/5 pb-2.5">
            Active Security Access Keys roster
          </h3>

          <div className="space-y-3">
            {apiKeys.length === 0 ? (
              <div className="text-xs text-gray-500 italic py-6 text-center">
                No active programmatic tokens currently registered on the node network.
              </div>
            ) : (
              apiKeys.map((key) => (
                <div key={key.id} className="bg-black/20 p-4 rounded-xl border border-white/4 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span className="text-xs font-semibold text-gray-200">{key.name}</span>
                    </div>
                    <div className="font-mono text-[9px] text-gray-500 flex flex-wrap gap-x-3.5 gap-y-0.5">
                      <span>Created: {key.createdAt.substring(0, 10)}</span>
                      <span>Last connection: {key.lastUsed}</span>
                    </div>
                    <span className="font-mono text-[10px] text-indigo-305 text-indigo-300 block line-clamp-1 break-all bg-black/40 p-1 px-1.5 rounded mt-1.5">
                      {key.key}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      id={`btn-api-copy-${key.id}`}
                      onClick={() => handleCopy(key.key, key.id)}
                      className="p-1 px-2 hover:bg-white/5 text-gray-400 hover:text-white rounded transition-colors cursor-pointer text-xs flex items-center gap-1 font-mono"
                      title="Copy Key String"
                    >
                      {copiedId === key.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copy
                        </>
                      )}
                    </button>
                    <button
                      id={`btn-api-delete-${key.id}`}
                      onClick={() => onDeleteKey(key.id)}
                      className="p-1.5 text-rose-455 text-rose-400 hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
                      title="Revoke and destroy key"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
