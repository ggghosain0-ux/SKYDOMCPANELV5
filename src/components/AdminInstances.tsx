/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Server, Cpu, Plus, Play, Trash2, ArrowRight } from "lucide-react";
import { GameInstance, SystemUser, PhysicalNode, InstanceStatus } from "../types";

interface AdminInstancesProps {
  instances: GameInstance[];
  users: SystemUser[];
  nodes: PhysicalNode[];
  onAddInstance: (instance: GameInstance) => void;
  onDeleteInstance: (id: string) => void;
  onSelectInstance: (instance: GameInstance) => void;
}

export default function AdminInstances({
  instances,
  users,
  nodes,
  onAddInstance,
  onDeleteInstance,
  onSelectInstance,
}: AdminInstancesProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [ownerId, setOwnerId] = useState(users[0]?.id || "6d0370");
  const [nodeId, setNodeId] = useState(nodes[0]?.id || "node_dal01");
  const [memoryLimitMB, setMemoryLimitMB] = useState(4096);
  const [cpuLimitPercent, setCpuLimitPercent] = useState(100);
  const [diskLimitGB, setDiskLimitGB] = useState(20);
  const [portsMaps, setPortsMaps] = useState("25565:25565");
  const [version, setVersion] = useState("Minecraft Spigot 1.20.4");
  const [eggName, setEggName] = useState("Minecraft Spigot");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const owner = users.find((u) => u.id === ownerId);
    const node = nodes.find((n) => n.id === nodeId);

    const newInst: GameInstance = {
      id: `inst_${Math.random().toString(36).substring(2, 8)}`,
      name: name.trim(),
      ownerId,
      ownerName: owner ? owner.username : "unknown",
      nodeId,
      nodeName: node ? node.name : "unknown",
      status: "stopped",
      ip: node ? node.ip : "127.0.0.1",
      port: 25565 + Math.floor(Math.random() * 100),
      memoryLimitMB,
      cpuLimitPercent,
      diskLimitGB,
      portsMaps,
      version,
      eggName,
    };

    onAddInstance(newInst);

    // Reset
    setName("");
    setMemoryLimitMB(4096);
    setCpuLimitPercent(100);
    setPortsMaps("25565:25565");
    setVersion("Minecraft Spigot 1.20.4");
    setEggName("Minecraft Spigot");
    setShowAddModal(false);
  };

  const getStatusIndicator = (status: InstanceStatus) => {
    switch (status) {
      case "running":
        return <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><span className="w-1 h-1 rounded-full bg-emerald-500" /> Online</span>;
      case "starting":
        return <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-505/10 text-indigo-400 border border-indigo-505/20"><span className="w-1 h-1 rounded-full bg-indigo-400 animate-pulse" /> Starting</span>;
      case "stopping":
        return <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20"><span className="w-1 h-1 rounded-full bg-amber-400 animate-pulse" /> Stopping</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20"><span className="w-1 h-1 rounded-full bg-rose-500" /> Offline</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex justify-between items-center bg-[#11121d] p-5 rounded-xl border border-white/5 shadow-xs">
        <div>
          <h2 className="text-xl font-display font-medium text-white tracking-tight">
            Administrative Instances Registry
          </h2>
          <p className="text-xs text-gray-400 font-sans">
            Orchestrate container parameters, deploy Docker volumes, and monitor performance profiles.
          </p>
        </div>
        <button
          id="btn-add-instance-modal"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-550 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-[0_4px_12px_rgba(79,70,229,0.25)] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Provision Instance Environment
        </button>
      </div>

      {/* Grid List */}
      <div className="bg-[#11121d] rounded-xl border border-white/5 overflow-hidden shadow-inner font-sans">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs select-none">
            <thead>
              <tr className="bg-[#0b0c10] border-b border-white/5 text-gray-400 font-mono">
                <th className="px-5 py-3 font-semibold uppercase tracking-wider">Environment Name</th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wider">IP / Node Bound</th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wider">Port Maps</th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wider">Owner Assignment</th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wider">Memory Allocation</th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/4 text-gray-300">
              {instances.map((instance) => (
                <tr key={instance.id} className="hover:bg-white/2 transition-colors">
                  {/* Name click to console */}
                  <td className="px-5 py-3.5">
                    <button
                      id={`instance-row-select-${instance.id}`}
                      onClick={() => onSelectInstance(instance)}
                      className="text-left font-semibold text-gray-200 hover:text-indigo-400 transition-colors cursor-pointer block"
                    >
                      <span className="flex items-center gap-2">
                        <Server className="w-4 h-4 shrink-0 text-indigo-400" />
                        {instance.name}
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono block mt-0.5">{instance.id} | {instance.version}</span>
                    </button>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-3.5">
                    {getStatusIndicator(instance.status)}
                  </td>

                  {/* Node Address */}
                  <td className="px-5 py-3.5 font-mono text-gray-400">
                    <span className="block text-gray-200">{instance.ip}:{instance.port}</span>
                    <span className="text-[10px] text-gray-500">{instance.nodeName}</span>
                  </td>

                  {/* Port maps */}
                  <td className="px-5 py-3.5 font-mono text-gray-400">
                    {instance.portsMaps}
                  </td>

                  {/* Owner */}
                  <td className="px-5 py-3.5 font-sans">
                    <span className="text-gray-200 block">{instance.ownerName}</span>
                    <span className="text-[10px] text-gray-500 font-mono">UID: {instance.ownerId}</span>
                  </td>

                  {/* RAM limit */}
                  <td className="px-5 py-3.5 font-mono text-gray-300">
                    <div className="flex flex-col">
                      <span>RAM: {instance.memoryLimitMB / 1024} GB</span>
                      <span className="text-[10px] text-gray-500">CPU Limit: {instance.cpuLimitPercent}%</span>
                    </div>
                  </td>

                  {/* Destroyer Action */}
                  <td className="px-5 py-3.5 text-right flex items-center justify-end gap-1.5 h-14">
                    <button
                      id={`instance-row-console-${instance.id}`}
                      onClick={() => onSelectInstance(instance)}
                      className="p-1 px-2 text-indigo-400 hover:text-white hover:bg-indigo-600/20 border border-indigo-550/10 rounded-md text-[10px] font-mono cursor-pointer flex items-center gap-1"
                      title="Launch Console HUD"
                    >
                      Console <ArrowRight className="w-3 h-3" />
                    </button>
                    <button
                      id={`instance-row-delete-${instance.id}`}
                      onClick={() => onDeleteInstance(instance.id)}
                      className="p-1 px-2 bg-rose-950/20 hover:bg-rose-900/40 text-rose-450 border border-rose-500/10 hover:border-rose-500/25 rounded-md text-[10px] font-mono transition-all cursor-pointer"
                      title="De-commission container"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Creation Wizard modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#06070a]/80 backdrop-blur-xs flex items-center justify-center p-4 z-40">
          <div className="glass-pane w-full max-w-lg p-6 rounded-2xl shadow-2xl relative space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400" />
              Deploy Virtual Instance Container
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block">
                  Environment Name
                </label>
                <input
                  id="instance-add-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Vanilla Bungee Proxy"
                  className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-xs text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block">
                    Owner Assignment (Database Link)
                  </label>
                  <select
                    id="instance-add-owner"
                    value={ownerId}
                    onChange={(e) => setOwnerId(e.target.value)}
                    className="w-full bg-[#0a0b10] border border-white/10 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-hidden focus:border-indigo-500 cursor-pointer text-ellipsis text-xs"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.username} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block">
                    Node Deployment Node
                  </label>
                  <select
                    id="instance-add-node"
                    value={nodeId}
                    onChange={(e) => setNodeId(e.target.value)}
                    className="w-full bg-[#0a0b10] border border-white/10 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-hidden focus:border-indigo-500 cursor-pointer"
                  >
                    {nodes.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.name} ({n.ip})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block">
                    Memory Allocation Limit (MB)
                  </label>
                  <input
                    id="instance-add-memory"
                    type="number"
                    required
                    value={memoryLimitMB}
                    onChange={(e) => setMemoryLimitMB(parseInt(e.target.value))}
                    className="w-full bg-black/40 border border-white/10 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block">
                    CPU Hyper-virtualization Limit (%)
                  </label>
                  <input
                    id="instance-add-cpu"
                    type="number"
                    required
                    value={cpuLimitPercent}
                    onChange={(e) => setCpuLimitPercent(parseInt(e.target.value))}
                    className="w-full bg-black/40 border border-white/10 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block">
                    Docker Image Software
                  </label>
                  <select
                    id="instance-add-software"
                    value={eggName}
                    onChange={(e) => {
                      setEggName(e.target.value);
                      if (e.target.value.includes("NodeJS")) setVersion("Node.js Runtime 20");
                      else if (e.target.value.includes("Paper")) setVersion("Minecraft Paper 1.20.2");
                      else setVersion("Minecraft Spigot 1.20.4");
                    }}
                    className="w-full bg-[#0a0b10] border border-white/10 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-hidden focus:border-indigo-500 cursor-pointer text-xs"
                  >
                    <option value="Minecraft Spigot">Minecraft Spigot</option>
                    <option value="Minecraft Paper">Minecraft Paper</option>
                    <option value="NodeJS Generic">Node.js Engine</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block">
                    Network Port maps
                  </label>
                  <input
                    id="instance-add-ports"
                    type="text"
                    required
                    value={portsMaps}
                    onChange={(e) => setPortsMaps(e.target.value)}
                    placeholder="25565:25565"
                    className="w-full bg-black/40 border border-white/10 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/5">
                <button
                  id="btn-instance-cancel"
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-750 text-gray-300 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="btn-instance-submit"
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-550 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Deploy Container
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
