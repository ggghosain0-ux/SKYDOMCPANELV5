/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  HardDrive, 
  Plus, 
  Tag, 
  Cpu, 
  Link2, 
  Trash2, 
  CheckCircle2, 
  Terminal, 
  Shield, 
  RotateCw, 
  Layers, 
  Server, 
  Check, 
  Loader2, 
  Info, 
  X, 
  Database, 
  Globe, 
  Activity,
  CheckCircle,
  Puzzle,
  RefreshCw,
  Sliders,
  Play
} from "lucide-react";
import { PhysicalNode } from "../types";

export interface VPSExtension {
  id: string;
  name: string;
  category: "Web & SSL" | "Database" | "Runtime" | "System Utility" | "Security";
  version: string;
  description: string;
  port?: number;
  installScript: string;
  uninstallScript: string;
}

const AVAILABLE_EXTENSIONS: VPSExtension[] = [
  {
    id: "nginx",
    name: "Nginx HTTP Proxy",
    category: "Web & SSL",
    version: "1.24.0",
    description: "High-performance reverse proxy, gateway balancer, and static file router.",
    port: 80,
    installScript: "sudo apt-get update -y && sudo apt-get install -y nginx-light\nsudo systemctl start nginx\nsudo systemctl enable nginx",
    uninstallScript: "sudo systemctl stop nginx\nsudo apt-get remove --purge -y nginx-light nginx-common\nsudo rm -rf /etc/nginx"
  },
  {
    id: "redis",
    name: "Redis Key Cache",
    category: "Database",
    version: "7.2.1",
    description: "In-memory key-value database, cache manager, and queue broker.",
    port: 6379,
    installScript: "sudo apt-get install -y redis-server\nsudo systemctl start redis-server\nsudo systemctl status redis-server",
    uninstallScript: "sudo systemctl stop redis-server\nsudo apt-get remove --purge -y redis-server"
  },
  {
    id: "mysql",
    name: "MariaDB SQL Daemon",
    category: "Database",
    version: "10.11.2",
    description: "Relational database to host standard user records and catalog logs.",
    port: 3306,
    installScript: "sudo apt-get install -y mariadb-server\nsudo systemctl start mariadb\nsudo systemctl enable mariadb",
    uninstallScript: "sudo systemctl stop mariadb\nsudo apt-get remove --purge -y mariadb-server && sudo rm -rf /var/lib/mysql"
  },
  {
    id: "openjdk21",
    name: "Java OpenJDK 21 Runtime",
    category: "Runtime",
    version: "21.0.2",
    description: "Required for compiling and executing Spigot/Paper Minecraft servers on the node.",
    installScript: "sudo apt-get update\nsudo apt-get install -y openjdk-21-jdk\njava --version",
    uninstallScript: "sudo apt-get remove --purge -y openjdk-21-jdk"
  },
  {
    id: "nodejs",
    name: "NodeJS LTS Runtime",
    category: "Runtime",
    version: "20.11.0",
    description: "Fast JavaScript environment execution layer for Discord bots, proxies, and web clusters.",
    installScript: "curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -\nsudo apt-get install -y nodejs\nnode -v",
    uninstallScript: "sudo apt-get remove -y nodejs"
  },
  {
    id: "docker",
    name: "Docker Engine Core",
    category: "System Utility",
    version: "25.0.3",
    description: "Essential physical virtualization engine running sandboxed game containers automatically.",
    installScript: "curl -fsSL https://get.docker.com -o get-docker.sh\nsudo sh get-docker.sh\nsudo systemctl start docker && sudo systemctl enable docker",
    uninstallScript: "sudo systemctl stop docker\nsudo apt-get purge -y docker-ce docker-ce-cli containerd.io"
  },
  {
    id: "fail2ban",
    name: "Fail2ban SSH Sentinel",
    category: "Security",
    version: "1.0.2",
    description: "Intrusion protection engine blacklisting brute-force external IP network threats.",
    installScript: "sudo apt-get install -y fail2ban\nsudo systemctl restart fail2ban\nsudo fail2ban-client status",
    uninstallScript: "sudo systemctl stop fail2ban\nsudo apt-get remove --purge -y fail2ban"
  },
  {
    id: "certbot",
    name: "Certbot SSL Daemon",
    category: "Security",
    version: "2.9.0",
    description: "ACME certificate package client to automatically request and deploy Let's Encrypt SSL certificates.",
    installScript: "sudo snap install --classic certbot\nsudo ln -s /snap/bin/certbot /usr/bin/certbot\ncertbot --version",
    uninstallScript: "sudo snap remove certbot\nsudo rm -f /usr/bin/certbot"
  }
];

interface AdminNodesProps {
  nodes: PhysicalNode[];
  onAddNode: (n: PhysicalNode) => void;
  onDeleteNode: (id: string) => void;
}

export default function AdminNodes({ nodes, onAddNode, onDeleteNode }: AdminNodesProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [ip, setIp] = useState("172.96.12.105");
  const [daemonPort, setDaemonPort] = useState(8080);
  const [ramMaxMB, setRamMaxMB] = useState(65536);
  const [diskLimitGB, setDiskLimitGB] = useState(1024);
  const [cpuCores, setCpuCores] = useState(16);
  const [tagInput, setTagInput] = useState("prod, nvme");

  // VPS Extensions state
  const [selectedNode, setSelectedNode] = useState<PhysicalNode | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [installedExtensions, setInstalledExtensions] = useState<Record<string, string[]>>(() => {
    // Seed initial installed packages on our default node to make the installation realistic!
    return {
      "node_dal01": ["docker", "openjdk21"]
    };
  });

  // Action / Console Simulator state
  const [currentOp, setCurrentOp] = useState<{
    nodeId: string;
    extId: string;
    type: "install" | "uninstall" | "restart";
    progress: number;
    terminalLogs: string[];
  } | null>(null);

  // Auto-scrolling system logs container terminal ref
  const logTerminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logTerminalEndRef.current) {
      logTerminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentOp?.terminalLogs]);

  // VPS statistics simulator (cpu/ram fluctuations)
  const [liveVitals, setLiveVitals] = useState({ cpu: 14, ram: 34, tickCount: 0 });
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveVitals(prev => {
        const nextCpu = Math.max(8, Math.min(48, prev.cpu + (Math.random() > 0.5 ? 2 : -2)));
        const nextRam = Math.max(25, Math.min(65, prev.ram + (Math.random() > 0.5 ? 0.3 : -0.3)));
        return { cpu: parseFloat(nextCpu.toFixed(1)), ram: parseFloat(nextRam.toFixed(1)), tickCount: prev.tickCount + 1 };
      });
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const tagsArr = tagInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const newNode: PhysicalNode = {
      id: `node_${Math.random().toString(36).substring(2, 8)}`,
      name: name.trim(),
      ip: ip.trim(),
      daemonPort,
      ramMaxMB,
      ramAllocatedMB: 0,
      diskLimitGB,
      diskAllocatedGB: 0,
      cpuCores,
      tags: tagsArr,
    };

    onAddNode(newNode);

    // Reset Form
    setName("");
    setIp("172.96.12.105");
    setTagInput("prod, nvme");
    setShowAddModal(false);
  };

  const handleOpenExtensions = (node: PhysicalNode) => {
    setSelectedNode(node);
    setActiveCategory("All");
  };

  const nodeInstalledCount = (nodeId: string) => {
    return (installedExtensions[nodeId] || []).length;
  };

  const getInstalledExtensionsList = (nodeId: string) => {
    const ids = installedExtensions[nodeId] || [];
    return AVAILABLE_EXTENSIONS.filter(ext => ids.includes(ext.id));
  };

  const triggerExtensionOp = (nodeId: string, extId: string, type: "install" | "uninstall" | "restart") => {
    if (currentOp) return; // Busy implementing an extension
    const ext = AVAILABLE_EXTENSIONS.find(e => e.id === extId);
    if (!ext) return;

    let progress = 0;
    const terminalLogs: string[] = [];
    const nodeName = nodes.find(n => n.id === nodeId)?.name || "node_host";

    const addLog = (text: string) => {
      terminalLogs.push(`[${new Date().toLocaleTimeString()}] ${text}`);
    };

    // Initialize simulation process lines
    if (type === "install") {
      addLog(`Initializing Secure WebSocket link with daemon process on port: 8080...`);
      addLog(`Secure Socket open! Host resolved as root@${nodeId} (${nodeName}).`);
      addLog(`Running script command: apt-get wrapper trigger.`);
      addLog(`$ ${ext.installScript.split('\n')[0]}`);
    } else if (type === "uninstall") {
      addLog(`Purging VPS package maps for extension module: ${ext.name}`);
      addLog(`$ ${ext.uninstallScript.split('\n')[0]}`);
    } else {
      addLog(`SIGHUP command sent to VPS. Restarting systemctl target daemon.`);
      addLog(`$ sudo systemctl restart ${ext.id}`);
    }

    setCurrentOp({
      nodeId,
      extId,
      type,
      progress: 0,
      terminalLogs: [...terminalLogs]
    });

    const isInstall = type === "install";
    const isUninstall = type === "uninstall";

    const steps = isInstall ? [
      { p: 15, log: `Checking host packages database...` },
      { p: 30, log: `Hit:1 http://security.debian.org/debian-security stable-security InRelease` },
      { p: 45, log: `Get:2 http://deb.debian.org/debian stable InRelease [151 kB]` },
      { p: 60, log: `Fetched 151 kB in 0.8s. Unpacking daemon payload: ${ext.id}_${ext.version}_amd64.deb` },
      { p: 75, log: `Setting up system variables in configuration folder...` },
      { p: 90, log: `Binding systemd startup parameters: /etc/systemd/system/${ext.id}.service` },
      { p: 100, log: `SUCCESS: VPS Extension ${ext.name} v${ext.version} successfully installed and running on host interface!` }
    ] : isUninstall ? [
      { p: 25, log: `System execution code PID-8828 killed. Halting dependencies...` },
      { p: 55, log: `Unmapping local environment configuration arrays and binary buffers...` },
      { p: 80, log: `Releasing active host port binder hooks...` },
      { p: 100, log: `SUCCESS: VPS Package ${ext.name} completely removed and purged from hardware machine.` }
    ] : [ // restart reload
      { p: 30, log: `Sending SIGTERM to listener sockets on node IP.` },
      { p: 65, log: `Parsing configuration tables... verified!` },
      { p: 100, log: `SUCCESS: Service ${ext.name} successfully restarted. Heartbeat status: Online.` }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        const step = steps[currentStep];
        addLog(step.log);
        progress = step.p;
        
        setCurrentOp(prev => prev ? {
          ...prev,
          progress,
          terminalLogs: [...terminalLogs]
        } : null);

        currentStep++;
      } else {
        clearInterval(interval);
        // Apply final changes to lists based on results
        if (isInstall) {
          setInstalledExtensions(prev => {
            const currentList = prev[nodeId] || [];
            if (!currentList.includes(extId)) {
              return { ...prev, [nodeId]: [...currentList, extId] };
            }
            return prev;
          });
        } else if (isUninstall) {
          setInstalledExtensions(prev => {
            const currentList = prev[nodeId] || [];
            return { ...prev, [nodeId]: currentList.filter(id => id !== extId) };
          });
        }
        
        // Hide overlay screen slightly after completed
        setTimeout(() => {
          setCurrentOp(null);
        }, 1200);
      }
    }, 700);
  };

  const filteredExtensions = AVAILABLE_EXTENSIONS.filter(ext => {
    if (activeCategory === "All") return true;
    if (activeCategory === "Web & SSL") return ext.category === "Web & SSL";
    if (activeCategory === "Database") return ext.category === "Database";
    if (activeCategory === "Runtime") return ext.category === "Runtime";
    if (activeCategory === "Security") return ext.category === "Security";
    if (activeCategory === "System Utility") return ext.category === "System Utility";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex justify-between items-center bg-[#11121d] p-5 rounded-xl border border-white/5 shadow-xs">
        <div>
          <h2 className="text-xl font-display font-medium text-white tracking-tight">
            Physical hardware nodes clusters
          </h2>
          <p className="text-xs text-gray-400 font-sans">
            Register VPS/baremetal machines, bind physical daemon controllers, and install system extensions directly on host layers.
          </p>
        </div>
        <button
          id="btn-add-node-modal"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-550 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-[0_4px_12px_rgba(79,70,229,0.25)] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Link Physical Hardware Node
        </button>
      </div>

      {/* Grid container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {nodes.map((node) => (
          <div key={node.id} className="bg-[#11121d] p-5 rounded-xl border border-white/5 flex flex-col justify-between shadow-xs">
            <div className="space-y-3.5">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <HardDrive className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-200">{node.name}</h3>
                    <span className="font-mono text-[10px] text-gray-500 uppercase">{node.id}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">Daemon Online</span>
                </div>
              </div>

              {/* Node statistics */}
              <div className="bg-black/20 p-3.5 rounded-lg border border-white/3 space-y-2.5 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Node IP Sockets:</span>
                  <span className="text-indigo-300">{node.ip}:{node.daemonPort}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Core Threads:</span>
                  <span className="text-gray-300">{node.cpuCores} Threads bound</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">RAM limits (Pool):</span>
                  <span className="text-gray-300">{node.ramMaxMB / 1024} GB Maximum</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Sata/NVMe storage:</span>
                  <span className="text-gray-300">{node.diskLimitGB} GB (NVMe limits)</span>
                </div>
              </div>

              {/* Installed VPS Extensions Tag Preview Bar */}
              <div className="bg-indigo-950/20 p-3 rounded-lg border border-indigo-550/10 font-sans">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest flex items-center gap-1">
                    <Puzzle className="w-3 h-3 text-indigo-400" /> Installed Host Packages ({nodeInstalledCount(node.id)})
                  </span>
                </div>
                {nodeInstalledCount(node.id) > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {getInstalledExtensionsList(node.id).map(ext => (
                      <span key={ext.id} className="inline-flex items-center gap-1 font-mono text-[9px] bg-emerald-400/10 text-emerald-400 border border-emerald-500/10 px-2 py-0.5 rounded-md uppercase font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                        {ext.name.split(" ")[0]}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-[10px] text-gray-500 italic">No system extensions synced. Managed via the VPS panel below.</span>
                )}
              </div>

              {/* Action Trigger for Package Expansion Modal */}
              <button
                id={`btn-node-extensions-${node.id}`}
                onClick={() => handleOpenExtensions(node)}
                className="w-full py-2.5 px-3 bg-[#1e212b] hover:bg-indigo-600 border border-white/5 hover:border-indigo-400text-white hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-inner uppercase tracking-wider text-gray-300"
              >
                <Puzzle className="w-3.5 h-3.5 text-indigo-400" />
                Manage VPS Extensions / Packages
              </button>

              {/* Tags allocated values */}
              <div className="flex flex-wrap gap-1.5 pt-1.5">
                {node.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 font-mono text-[9px] font-bold tracking-tight bg-neutral-800 text-neutral-350 border border-white/5 px-2 py-0.5 rounded-md uppercase"
                  >
                    <Tag className="w-2.5 h-2.5" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/4 mt-4 flex justify-between items-center text-xs">
              <div className="flex items-center gap-1 text-gray-500">
                <Link2 className="w-3.5 h-3.5 text-emerald-500" /> Linked SSL TLS Security Socket
              </div>

              <button
                id={`btn-node-delete-${node.id}`}
                onClick={() => onDeleteNode(node.id)}
                disabled={nodes.length <= 1} // Protect at least one node
                className="p-1.5 bg-rose-950/20 hover:bg-rose-900/40 text-rose-500 border border-rose-500/10 hover:border-rose-500/25 rounded-md transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                title="Destroy hardware mapping"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* VPS Extensions & Packages Manager Side Overlay Modal */}
      {selectedNode && (
        <div className="fixed inset-0 bg-[#06070a]/92 backdrop-blur-sm flex items-center justify-center p-4 z-40 animate-fadeIn">
          <div className="bg-[#11121d] border border-white/10 w-full max-w-5xl rounded-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-black/30 px-6 py-4.5 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/15 flex items-center justify-center text-indigo-400">
                  <Puzzle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    VPS Package & Extension Deployer
                    <span className="text-[10px] font-mono py-0.5 px-2 rounded-full bg-indigo-900/40 text-indigo-300 border border-indigo-500/15 uppercase font-medium">
                      Host Terminal Sync
                    </span>
                  </h3>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">
                    Managing Host: <strong className="text-gray-200">{selectedNode.name}</strong> • Sockets: <span className="text-indigo-400">{selectedNode.ip}:{selectedNode.daemonPort}</span>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  if (currentOp) return; // Block closing if script executing
                  setSelectedNode(null);
                }}
                disabled={!!currentOp}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Split Screen Container */}
            <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
              
              {/* Left Column (Host Logs, Active Terminal OR Vitals Console Indicators) */}
              <div className="lg:col-span-5 border-r border-white/5 bg-[#0a0b11] p-5 flex flex-col justify-between overflow-y-auto space-y-5">
                
                {/* Real-time execution shell */}
                <div className="flex-1 flex flex-col min-h-[280px]">
                  <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-2 flex items-center gap-1">
                    <Terminal className="w-3.5 h-3.5 text-indigo-400" /> Host Integration Console Shell (Debian 12)
                  </div>
                  <div className="flex-1 rounded-xl bg-black/70 border border-white/15 p-4 font-mono text-[11px] leading-relaxed text-indigo-300 overflow-y-auto max-h-[380px] flex flex-col justify-between shadow-inner">
                    <div className="space-y-1.5 font-mono text-xs">
                      <div className="text-gray-500"># Secure TLS Link initialized on daemon websocket...</div>
                      <div className="text-indigo-400">[Secure System Channel established success]</div>
                      
                      {currentOp ? (
                        currentOp.terminalLogs.map((log, index) => (
                          <div key={index} className="pl-2 border-l border-emerald-500/20 text-emerald-400 animate-slideUp">
                            {log}
                          </div>
                        ))
                      ) : (
                        <>
                          <div className="text-gray-500">root@skypanel-node:~# daemon-client info</div>
                          <div className="text-gray-400">Total physical core allocations: {selectedNode.cpuCores} threads</div>
                          <div className="text-gray-400">Total static dynamic storage: {selectedNode.diskLimitGB} GB (NVMe Partition)</div>
                          <div className="text-gray-400">Synced packages mapping daemon: Active</div>
                          <div className="text-amber-400 italic mt-3 animate-pulse">
                            ● Status: System idle. Deploy, upgrade, or remove packages from the catalog to trigger secure bash installer scripts automatically.
                          </div>
                        </>
                      )}
                      
                      {/* Empty ref for auto scrolling */}
                      <div ref={logTerminalEndRef} />
                    </div>
                  </div>
                </div>

                {/* VPS Performance Indicators Graph Panels */}
                <div className="bg-[#11121d] border border-white/5 p-4 rounded-xl space-y-4 font-sans">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#9ca3af] flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-[#fbbf24]" /> VPS Live Status Monitoring
                    </span>
                    <span className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-400/10 text-amber-400">
                      Ping: 12ms (Socket Live)
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400 flex items-center gap-1">
                          <Cpu className="w-3 h-3 text-indigo-400" /> Host CPU Threads Jitter
                        </span>
                        <span className="text-indigo-300 font-mono font-bold">{liveVitals.cpu}%</span>
                      </div>
                      <div className="w-full bg-[#0d0e12] rounded-full h-1.5 border border-white/5">
                        <div 
                          className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${liveVitals.cpu}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400 flex items-center gap-1">
                          <Layers className="w-3 h-3 text-emerald-400" /> Node RAM Cache Consumed
                        </span>
                        <span className="text-emerald-400 font-mono font-bold">{liveVitals.ram}%</span>
                      </div>
                      <div className="w-full bg-[#0d0e12] rounded-full h-1.5 border border-white/5">
                        <div 
                          className="bg-emerald-500 h-1.5 rounded-full transition-all duration-1000"
                          style={{ width: `${liveVitals.ram}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column (Extensions Deployer Catalog List) */}
              <div className="lg:col-span-7 p-6 flex flex-col justify-between overflow-y-auto">
                <div className="space-y-5">
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">System Packages Core Directory</h4>
                      <p className="text-[11px] text-gray-400">Select standard VPS extensions to deploy instantly via SSL binary package installers.</p>
                    </div>
                  </div>

                  {/* Horizontal Categories Filter */}
                  <div className="flex flex-wrap gap-1.5 bg-[#0d0e12]/80 p-1.5 rounded-lg border border-white/5">
                    {["All", "Web & SSL", "Database", "Runtime", "Security", "System Utility"].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          if (currentOp) return;
                          setActiveCategory(cat);
                        }}
                        className={`px-3 py-1.5 rounded-md text-xs font-sans font-semibold transition-all cursor-pointer select-none ${
                          activeCategory === cat 
                            ? "bg-indigo-600 text-white shadow-xs" 
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Extensions Cards Grid Scrollable */}
                  <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1">
                    {filteredExtensions.map((ext) => {
                      const isInstalled = (installedExtensions[selectedNode.id] || []).includes(ext.id);
                      const isWorking = currentOp && currentOp.extId === ext.id && currentOp.nodeId === selectedNode.id;
                      
                      return (
                        <div 
                          key={ext.id} 
                          className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center md:justify-between gap-4 select-none ${
                            isInstalled 
                              ? "bg-emerald-950/10 border-emerald-500/20 hover:border-emerald-500/35" 
                              : "bg-[#181a28]/60 border-white/5 hover:border-white/10"
                          }`}
                        >
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              {ext.category === "Web & SSL" && <Globe className="w-4 h-4 text-emerald-400 shrink-0" />}
                              {ext.category === "Database" && <Database className="w-4 h-4 text-cyan-400 shrink-0" />}
                              {ext.category === "Runtime" && <Cpu className="w-4 h-4 text-amber-400 shrink-0" />}
                              {ext.category === "Security" && <Shield className="w-4 h-4 text-indigo-400 shrink-0" />}
                              {ext.category === "System Utility" && <Server className="w-4 h-4 text-purple-400 shrink-0" />}
                              
                              <h5 className="text-xs font-bold text-gray-100 uppercase tracking-wide truncate">{ext.name}</h5>
                              <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-black/40 text-gray-400 font-bold border border-white/5">
                                v{ext.version}
                              </span>

                              {isInstalled && (
                                <span className="inline-flex items-center gap-1 font-mono text-[8px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/20 uppercase font-bold tracking-wider">
                                  <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping" />
                                  Running
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-400 leading-normal font-sans pr-2">
                              {ext.description}
                            </p>
                            {ext.port && (
                              <span className="inline-block font-mono text-[9px] text-[#fbbf24] bg-amber-500/10 border border-amber-500/15 px-1.5 rounded">
                                Interface Port: {ext.port}
                              </span>
                            )}
                          </div>

                          {/* Action Controllers */}
                          <div className="flex items-center gap-2 font-mono shrink-0">
                            {isWorking ? (
                              <div className="flex items-center gap-1.5 font-sans">
                                <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                                <span className="text-xs text-indigo-300 font-bold animate-pulse">
                                  Executing ({currentOp.progress}%)
                                </span>
                              </div>
                            ) : isInstalled ? (
                              <div className="flex md:flex-col lg:flex-row gap-2">
                                <button
                                  type="button"
                                  disabled={!!currentOp}
                                  onClick={() => triggerExtensionOp(selectedNode.id, ext.id, "restart")}
                                  className="px-2.5 py-1.5 bg-[#fbbf24]/10 hover:bg-[#fbbf24]/20 text-[#fbbf24] hover:text-[#fbbf24] border border-[#fbbf24]/20 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-20 disabled:cursor-not-allowed"
                                  title="Reboot active host service"
                                >
                                  <RefreshCw className="w-3 h-3 text-[#fbbf24]" />
                                  Reboot
                                </button>
                                <button
                                  type="button"
                                  disabled={!!currentOp}
                                  onClick={() => triggerExtensionOp(selectedNode.id, ext.id, "uninstall")}
                                  className="px-2.5 py-1.5 bg-rose-550/10 hover:bg-rose-550/25 text-rose-400 hover:text-rose-300 border border-rose-500/15 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed"
                                >
                                  Purge VPS
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                disabled={!!currentOp}
                                onClick={() => triggerExtensionOp(selectedNode.id, ext.id, "install")}
                                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-sans font-semibold transition-colors cursor-pointer flex items-center gap-1 shadow-md hover:shadow-indigo-650/20 disabled:opacity-20 disabled:cursor-not-allowed"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                Install into VPS
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>

                {/* Footer terms mapping */}
                <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center text-[10px] text-gray-500 font-mono">
                  <span>SSL PROXIES COMPLIANCE STANDARDS: HIGH</span>
                  <span>VPS HARDWARE ALLOCATION WRAPPERS VERIFIED</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Creation Modal form over */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#06070a]/80 backdrop-blur-xs flex items-center justify-center p-4 z-40">
          <div className="glass-pane w-full max-w-lg p-6 rounded-2xl shadow-2xl relative space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-indigo-400" />
              Link Physical Baremetal Node
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block">
                  Cluster Name
                </label>
                <input
                  id="node-add-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Dallas Ryzen NVME-05"
                  className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-xs text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block">
                    Host IP Binding
                  </label>
                  <input
                    id="node-add-ip"
                    type="text"
                    required
                    value={ip}
                    onChange={(e) => setIp(e.target.value)}
                    placeholder="172.96.12.100"
                    className="w-full bg-black/40 border border-white/10 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block">
                    Controller Daemon Port
                  </label>
                  <input
                    id="node-add-port"
                    type="number"
                    required
                    value={daemonPort}
                    onChange={(e) => setDaemonPort(parseInt(e.target.value))}
                    className="w-full bg-black/40 border border-white/10 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block">
                    Max RAM (MB)
                  </label>
                  <input
                    id="node-add-ram"
                    type="number"
                    required
                    value={ramMaxMB}
                    onChange={(e) => setRamMaxMB(parseInt(e.target.value))}
                    className="w-full bg-black/40 border border-white/10 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block">
                    Max Disk (GB)
                  </label>
                  <input
                    id="node-add-disk"
                    type="number"
                    required
                    value={diskLimitGB}
                    onChange={(e) => setDiskLimitGB(parseInt(e.target.value))}
                    className="w-full bg-black/40 border border-white/10 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block">
                    CPU Core counts
                  </label>
                  <input
                    id="node-add-cpu"
                    type="number"
                    required
                    value={cpuCores}
                    onChange={(e) => setCpuCores(parseInt(e.target.value))}
                    className="w-full bg-black/40 border border-white/10 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block">
                  System allocation Tags (Comma Separated)
                </label>
                <input
                  id="node-add-tags"
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="prod, nvme, dallas"
                  className="w-full bg-black/40 border border-white/10 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/5">
                <button
                  id="btn-node-cancel"
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-750 text-gray-300 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="btn-node-submit"
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-550 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Confirm Mapping
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
