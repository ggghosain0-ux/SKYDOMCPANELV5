/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  RotateCw,
  Square,
  Terminal,
  Cpu,
  Database,
  ArrowDownLeft,
  ArrowUpRight,
  Send,
  Loader2,
  ServerCrash,
  Folder,
  FileText,
  Plus,
  Trash2,
  Settings,
  Users,
  Calendar,
  Layers,
  Shield,
  FileCode,
  HardDrive,
  Download,
  Check,
  AlertCircle,
  HelpCircle,
  Clock,
  Eye,
  ChevronRight,
  RefreshCw,
  Sliders,
  Sparkles,
  Link
} from "lucide-react";
import { GameInstance, InstanceStatus, PluginExtension } from "../types";
import { simulatedLogPool } from "../mockData";
import { api } from "../api";

interface InstanceConsoleProps {
  instance: GameInstance;
  onStatusChange: (instanceId: string, status: InstanceStatus) => void;
  onBack?: () => void;
  plugins?: PluginExtension[];
  onUpdateInstance?: (updated: GameInstance) => void;
}

export default function InstanceConsole({ 
  instance, 
  onStatusChange, 
  onBack,
  plugins = [],
  onUpdateInstance
}: InstanceConsoleProps) {
  // Navigation tabs matching premium setups
  const [activeTab, setActiveTab] = useState<"console" | "files" | "plugins" | "databases" | "schedules" | "users" | "backups" | "network" | "startup" | "settings">("console");
  const [status, setStatus] = useState<InstanceStatus>(instance.status);
  const [logs, setLogs] = useState<string[]>([]);
  const [commandInput, setCommandInput] = useState("");
  
  // Instance metrics history
  const [cpuHistory, setCpuHistory] = useState<number[]>(Array(15).fill(0));
  const [ramHistory, setRamHistory] = useState<number[]>(Array(15).fill(0));
  const [netInHistory, setNetInHistory] = useState<number[]>(Array(15).fill(0));
  const [netOutHistory, setNetOutHistory] = useState<number[]>(Array(15).fill(0));

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const startLogTimer = useRef<NodeJS.Timeout | null>(null);
  const metricsInterval = useRef<NodeJS.Timeout | null>(null);

  // File Manager State
  const [currentPath, setCurrentPath] = useState<string>("");
  const [loadingFiles, setLoadingFiles] = useState<boolean>(false);
  const [filesList, setFilesList] = useState<{ name: string; type: "file" | "directory"; size: string; content?: string }[]>([]);

  // Dialog / Modal editing windows
  const [showFileModal, setShowFileModal] = useState(false);
  const [editingFileName, setEditingFileName] = useState("");
  const [editingFileContent, setEditingFileContent] = useState("");
  const [isCreatingNewFile, setIsCreatingNewFile] = useState(false);
  
  // Local installed status of plugins for this specific instance
  const [installedPlugins, setInstalledPlugins] = useState<string[]>(["pl_worldedit"]);

  // Databases state
  const [databases, setDatabases] = useState<{ id: string; name: string; user: string; host: string; maxConnections: number }[]>([
    { id: "db_01", name: "s1_primary_db", user: "u1_f2301x", host: "172.96.12.1", maxConnections: 100 }
  ]);
  const [newDbName, setNewDbName] = useState("");

  // Sub-users state
  const [subusers, setSubusers] = useState<{ id: string; email: string; role: string; perms: string[] }[]>([
    { id: "usr_sb_01", email: "helper@skyport.alt", role: "Moderator", perms: ["Control Power", "Access Console"] }
  ]);
  const [subuserEmail, setSubuserEmail] = useState("");
  const [subuserRole, setSubuserRole] = useState("Developer");

  // Backups state
  const [backups, setBackups] = useState<{ id: string; name: string; size: string; status: "completed" | "creating"; checksum: string; createdAt: string }[]>([
    { id: "bk_01", name: "automated-snapshot-sky-node.zip", size: "142 MB", status: "completed", checksum: "sha255_f12a93c12", createdAt: "2026-05-24T12:00:00Z" }
  ]);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);

  // Network allocations state
  const [networks, setNetworks] = useState<{ id: string; port: number; ip: string; isPrimary: boolean; label: string }[]>([
    { id: "net_01", port: instance.port, ip: instance.ip, isPrimary: true, label: "Primary Minecraft Game Port" }
  ]);

  // Schedules state
  const [schedules, setSchedules] = useState<{ id: string; name: string; expression: string; active: boolean; lastRun: string }[]>([
    { id: "sch_01", name: "Midnight Saved Chunks Snapshot", expression: "0 0 * * *", active: true, lastRun: "2026-05-25T00:00:00Z" }
  ]);
  const [scheduleName, setScheduleName] = useState("");
  const [scheduleCron, setScheduleCron] = useState("0 12 * * *");

  // Selected Server Settings
  const [serverNameInput, setServerNameInput] = useState(instance.name);
  const [serverBgUrlInput, setServerBgUrlInput] = useState(instance.bgImageUrl || "");
  const [successToast, setSuccessToast] = useState("");

  // Sync state if instance loads or changes external status
  useEffect(() => {
    setStatus(instance.status);
    const pool = simulatedLogPool[instance.id] || [];
    setLogs([...pool]);
    setServerNameInput(instance.name);
    setServerBgUrlInput(instance.bgImageUrl || "");
  }, [instance]);

  // Handle auto scroll terminal
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Load real files from physical host sandboxed directories on VPS
  const fetchInstanceFiles = async () => {
    setLoadingFiles(true);
    try {
      const data = await api.getInstanceFiles(instance.id, currentPath);
      setFilesList(data || []);
    } catch (err) {
      console.error("Failed to fetch host physical index listings:", err);
    } finally {
      setLoadingFiles(false);
    }
  };

  useEffect(() => {
    if (activeTab === "files") {
      fetchInstanceFiles();
    }
  }, [currentPath, activeTab, instance.id]);

  // Fluctuating real-time metrics simulator
  useEffect(() => {
    if (metricsInterval.current) clearInterval(metricsInterval.current);

    metricsInterval.current = setInterval(() => {
      setCpuHistory((prev) => {
        let nextValue = 0;
        if (status === "running") {
          const base = 15 + Math.random() * 35; // 15% - 50%
          nextValue = Math.min(instance.cpuLimitPercent, base);
        } else if (status === "starting") {
          nextValue = 80 + Math.random() * 15; // startup spike
        }
        const next = [...prev.slice(1), parseFloat(nextValue.toFixed(1))];
        return next;
      });

      setRamHistory((prev) => {
        let nextValue = 0;
        if (status === "running") {
          const capPercent = 0.45 + Math.random() * 0.15; // 45% - 60%
          nextValue = instance.memoryLimitMB * capPercent;
        } else if (status === "starting") {
          nextValue = instance.memoryLimitMB * 0.35; // Loading memory
        }
        const next = [...prev.slice(1), parseFloat(nextValue.toFixed(0))];
        return next;
      });

      setNetInHistory((prev) => {
        const nextValue = status === "running" ? Math.random() * 8.4 : 0;
        return [...prev.slice(1), parseFloat(nextValue.toFixed(2))];
      });

      setNetOutHistory((prev) => {
        const nextValue = status === "running" ? Math.random() * 21.8 : 0;
        return [...prev.slice(1), parseFloat(nextValue.toFixed(2))];
      });
    }, 1500);

    return () => {
      if (metricsInterval.current) clearInterval(metricsInterval.current);
    };
  }, [status, instance]);

  // Log streaming animation for STARTING sequence
  const executeStartupSequence = () => {
    setLogs(["[Skypanel-Daemon] Initializing Docker secure container..."]);
    onStatusChange(instance.id, "starting");
    setStatus("starting");

    const flowLogs = [
      `[Docker-Engine] Mounting container overlay memory bounds: maxAlloc=${instance.memoryLimitMB}MB`,
      `[Docker-Engine] Loading Java Development Kit JRE/JDK 17.0.12 runtime from cache pool...`,
      `[JVM] Bootstrapping executable: server.jar`,
      `[Minecraft-Spigot] Allocating standard thread pool bounds. CPU affinity locked.`,
      "[Minecraft-Spigot] Preparations started. Syncing level configuration keys...",
      "[Minecraft-Spigot] Loaded default configurations from server.properties",
      ...installedPlugins.map(plId => {
        const pl = plugins.find(p => p.id === plId);
        return pl ? `[Minecraft-Spigot] [PluginLoader] Enabling ${pl.name} v${pl.version}... Complete!` : "";
      }).filter(Boolean),
      "[Minecraft-Spigot] Generating dimension maps default: world_survival",
      "[Minecraft-Spigot] Completed chunk mapping generation in 280ms.",
      `[System-State] Game server successfully allocated on sandbox socket: ${instance.ip}:${instance.port}`,
      "[System-State] Container online. TCP socket listening for incoming gamers."
    ];

    let currentLine = 0;
    if (startLogTimer.current) clearInterval(startLogTimer.current);

    startLogTimer.current = setInterval(() => {
      if (currentLine < flowLogs.length) {
        setLogs((prev) => [...prev, flowLogs[currentLine]]);
        currentLine++;
      } else {
        if (startLogTimer.current) clearInterval(startLogTimer.current);
        setStatus("running");
        onStatusChange(instance.id, "running");
      }
    }, 400);
  };

  const handleStart = () => {
    if (status === "running" || status === "starting" || status === "stopping") return;
    executeStartupSequence();
  };

  const handleStop = () => {
    if (status === "stopped") return;
    setStatus("stopping");
    onStatusChange(instance.id, "stopping");

    setLogs((prev) => [
      ...prev,
      "[System-Signal] Graceful STOP intercept triggered.",
      "[Minecraft-Spigot] Saving chunks and database files to storage...",
      "[Minecraft-Spigot] Unbinding active ports. Server shut down.",
      "[System-State] Container offline. Standby mode initialized."
    ]);

    setTimeout(() => {
      setStatus("stopped");
      onStatusChange(instance.id, "stopped");
    }, 800);
  };

  const handleRestart = () => {
    setStatus("stopping");
    onStatusChange(instance.id, "stopping");
    setLogs((prev) => [...prev, "[System-Signal] RESTART command queued. Commencing container recycle..."]);

    setTimeout(() => {
      executeStartupSequence();
    }, 1000);
  };

  const handleSendCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;

    const cmd = commandInput.trim();
    setCommandInput("");

    setLogs((prev) => [...prev, `root@skypanel-console:~$ ${cmd}`]);

    setTimeout(() => {
      if (status !== "running") {
        setLogs((prev) => [
          ...prev,
          "[Skypanel-Daemon] Command execution aborted. Container is currently offline."
        ]);
        return;
      }

      const lowerCmd = cmd.toLowerCase().replace(/^\//, "");
      if (lowerCmd === "help") {
        setLogs((prev) => [
          ...prev,
          "--- Skypanel Console Commands ---",
          "  /list           - View online players.",
          "  /say <message>  - Send server broadcast.",
          "  /plugins        - Query installed console plugins.",
          "  /vitals         - Dump system resource allocations.",
          "  /stop           - Graceful shutdown."
        ]);
      } else if (lowerCmd === "list") {
        setLogs((prev) => [
          ...prev,
          "[Minecraft-Spigot] Active players (3/20): Steve, Alex, Player_Aether"
        ]);
      } else if (lowerCmd === "plugins") {
        const loadedPlNames = installedPlugins.map(pid => plugins.find(p => p.id === pid)?.name || pid);
        setLogs((prev) => [
          ...prev,
          `[Minecraft-Spigot] Plugins loaded (${installedPlugins.length}): ${loadedPlNames.join(", ") || "None"}`
        ]);
      } else if (lowerCmd.startsWith("say ")) {
        setLogs((prev) => [...prev, `[Server Broadcast] ${cmd.substring(4)}`]);
      } else if (lowerCmd === "vitals") {
        const cpu = cpuHistory[cpuHistory.length - 1];
        const mem = ramHistory[ramHistory.length - 1];
        setLogs((prev) => [
          ...prev,
          `-- CURRENT JVM STATE --`,
          `  CPU Usage: ${cpu}%`,
          `  Memory Maps: ${mem}MB / ${instance.memoryLimitMB}MB`,
          `  Socket: ${instance.ip}:${instance.port}`
        ]);
      } else if (lowerCmd === "stop") {
        handleStop();
      } else {
        setLogs((prev) => [...prev, `[Spigot Engine] Command unknown. Read '/help' for directions.`]);
      }
    }, 200);
  };

  // Sparkline Spark render
  const renderSparkline = (data: number[], colorClass: string) => {
    if (data.length === 0) return null;
    const maxVal = Math.max(...data, 1);
    const pts = data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * 100;
      const y = 30 - (val / maxVal) * 26;
      return `${x},${y}`;
    });
    return (
      <svg className="w-20 h-7 overflow-visible select-none" viewBox="0 0 100 30">
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={pts.join(" ")}
          className={colorClass}
        />
      </svg>
    );
  };

  // File Manager Helpers
  const getDirContents = () => {
    return filesList;
  };

  const handleNavigateFolder = (folderName: string) => {
    const nextPath = currentPath ? `${currentPath}/${folderName}` : folderName;
    setCurrentPath(nextPath);
  };

  const handleNavigateUp = () => {
    if (!currentPath) return;
    const lastSlashIdx = currentPath.lastIndexOf("/");
    if (lastSlashIdx === -1) {
      setCurrentPath("");
    } else {
      setCurrentPath(currentPath.substring(0, lastSlashIdx));
    }
  };

  const handleDeleteFile = async (fileName: string) => {
    try {
      const targetFilePath = currentPath ? `${currentPath}/${fileName}` : fileName;
      await api.deleteInstanceFile(instance.id, targetFilePath);
      triggerToast(`Successfully deleted '${fileName}'`);
      fetchInstanceFiles();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenFileEditor = (name: string, content = "", isNew = false) => {
    setEditingFileName(name);
    setEditingFileContent(content);
    setIsCreatingNewFile(isNew);
    setShowFileModal(true);
  };

  const handleSaveFile = async () => {
    if (!editingFileName.trim()) return;
    try {
      const targetFilePath = currentPath ? `${currentPath}/${editingFileName}` : editingFileName;
      await api.writeInstanceFile(instance.id, targetFilePath, editingFileContent);
      setShowFileModal(false);
      triggerToast(`File ${isCreatingNewFile ? "created" : "updated"} successfully`);
      fetchInstanceFiles();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateDirectory = async () => {
    const dName = prompt("Enter directory folder name:");
    if (!dName) return;
    try {
      const targetDirPath = currentPath ? `${currentPath}/${dName}` : dName;
      await api.createInstanceDir(instance.id, targetDirPath);
      triggerToast(`Directory '/${dName}' initialized`);
      fetchInstanceFiles();
    } catch (err) {
      console.error(err);
    }
  };

  // Plugin Installation Engine
  const handleInstallPlugin = async (pl: PluginExtension) => {
    if ((installedPlugins || []).includes(pl.id)) return;

    setInstalledPlugins((prev) => [...prev, pl.id]);

    // 1. Add file inside the plugins path
    const fileName = pl.fileName || `${pl.id}.jar`;
    const targetFilePath = `plugins/${fileName}`;
    const fileContent = `[Compiled binary representation classes of ${pl.name}]`;

    try {
      await api.writeInstanceFile(instance.id, targetFilePath, fileContent);
      if (activeTab === "files" && currentPath === "plugins") {
        fetchInstanceFiles();
      }
    } catch (err) {
      console.error("Failed to write plugin jar file:", err);
    }

    // 2. Stream lines to terminal if running
    if (status === "running") {
      const installText = pl.sourceType === "download_link"
        ? `[Skypanel-Agent] Resolving URL download stream from: ${pl.downloadUrl} -> /plugins/${fileName}`
        : `[Skypanel-Agent] Copied physical local binary: ${fileName} -> /plugins/${fileName}`;
      setLogs((prev) => [
        ...prev,
        installText,
        `[Minecraft-Spigot] [PluginLoader] Enabling Hot Module Addon: ${pl.name} v${pl.version}...`,
        `[Minecraft-Spigot] [${pl.name}] System bind loaded successfully! Starting console metrics mapping.`
      ]);
    } else {
      setLogs((prev) => [
        ...prev,
        `[Skypanel-Client] Plugin target ${pl.name} set to Auto-Load on next startup bootstrap. (${pl.sourceType === "download_link" ? "Queued curl download" : "Queued file copy"})`
      ]);
    }

    triggerToast(`Plugin '${pl.name}' deployed successfully into file manager`);
  };

  const handleUninstallPlugin = async (plId: string) => {
    const pl = plugins.find(p => p.id === plId);
    if (!pl) return;

    setInstalledPlugins((prev) => prev.filter((id) => id !== plId));
    
    // Remove the jar from file state
    const fileName = pl.fileName || `${pl.id}.jar`;
    const targetFilePath = `plugins/${fileName}`;
    try {
      await api.deleteInstanceFile(instance.id, targetFilePath);
      if (activeTab === "files" && currentPath === "plugins") {
        fetchInstanceFiles();
      }
    } catch (err) {
      console.error("Failed to delete plugin jar file:", err);
    }

    if (status === "running") {
      setLogs((prev) => [
        ...prev,
        `[Skypanel-Agent] Deleted plugin file ${fileName} from node host.`,
        `[Minecraft-Spigot] [PluginLoader] Hot-unloading plugin: ${pl.name}.`
      ]);
    }

    triggerToast(`Plugin '${pl.name}' removed from compiled containers.`);
  };

  // Database additions
  const handleCreateDatabase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDbName.trim()) return;

    const formatted = newDbName.toLowerCase().replace(/\s+/g, "_");
    const uniqueId = `db_${Math.random().toString(36).substring(2, 6)}`;
    const newDb = {
      id: uniqueId,
      name: `s1_${formatted}`,
      user: `u1_${Math.random().toString(36).substring(2, 8)}`,
      host: "172.96.12.1",
      maxConnections: 100
    };

    setDatabases((prev) => [...prev, newDb]);
    setNewDbName("");
    triggerToast(`Database '${newDb.name}' allocated on Node core`);
  };

  const handleDeleteDatabase = (id: string, name: string) => {
    setDatabases((prev) => prev.filter((d) => d.id !== id));
    triggerToast(`Deallocated SQL database: ${name}`);
  };

  // Schedule cron tasks
  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleName.trim()) return;

    const newSch = {
      id: `sch_${Math.random().toString(36).substring(2, 6)}`,
      name: scheduleName.trim(),
      expression: scheduleCron,
      active: true,
      lastRun: "Never"
    };

    setSchedules((prev) => [...prev, newSch]);
    setScheduleName("");
    triggerToast(`Cron schedule '${newSch.name}' initialized`);
  };

  // Backup snap creation
  const handleTriggerBackup = () => {
    if (isCreatingBackup) return;
    setIsCreatingBackup(true);
    setBackupProgress(10);

    const interval = setInterval(() => {
      setBackupProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsCreatingBackup(false);
          const newBk = {
            id: `bk_${Math.random().toString(36).substring(2, 6)}`,
            name: `snapshot-${new Date().toISOString().slice(0,10)}-${Math.random().toString(36).substring(2,6)}.zip`,
            size: `${(45 + Math.random() * 120).toFixed(1)} MB`,
            status: "completed" as const,
            checksum: `sha255_b${Math.random().toString(36).substring(2,9)}`,
            createdAt: new Date().toISOString()
          };
          setBackups((prevList) => [newBk, ...prevList]);
          
          if (status === "running") {
            setLogs((prevLogs) => [
              ...prevLogs,
              `[Skypanel-Backup] Successfully packed archive ${newBk.name} [${newBk.size}]`,
              `[Skypanel-Backup] Snapshot encryption completed. Output saved.`
            ]);
          }

          triggerToast("Backup zip compiled successfully.");
          return 0;
        }
        return prev + 25;
      });
    }, 400);
  };

  // Subuser invites
  const handleInviteSubuser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subuserEmail.trim()) return;

    const newSub = {
      id: `usr_sb_${Math.random().toString(36).substring(2,6)}`,
      email: subuserEmail.trim().toLowerCase(),
      role: subuserRole,
      perms: ["Control Power", "Access Console"]
    };

    setSubusers((prev) => [...prev, newSub]);
    setSubuserEmail("");
    triggerToast(`Invited ${newSub.email} as co-owner`);
  };

  // Helper Toast Alerts
  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(""), 3000);
  };

  const getStatusBadge = () => {
    switch (status) {
      case "running":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-450 border border-emerald-500/25 text-[10px] font-mono tracking-wide uppercase font-bold animate-fadeIn">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping mr-1" />
            Online
          </span>
        );
      case "starting":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-indigo-505/10 text-indigo-400 border border-indigo-550/20 text-[10px] font-mono tracking-wide uppercase font-bold animate-fadeIn">
            <Loader2 className="w-3 h-3 animate-spin mr-1" />
            Booting
          </span>
        );
      case "stopping":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-mono tracking-wide uppercase font-bold animate-fadeIn">
            <Loader2 className="w-3 h-3 animate-spin mr-1 text-red-500" />
            Stopping
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-white/5 text-gray-400 border border-white/5 text-[10px] font-mono tracking-wide uppercase font-bold animate-fadeIn">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-500 mr-1" />
            Offline
          </span>
        );
    }
  };

  const currentCpu = cpuHistory[cpuHistory.length - 1];
  const currentRam = ramHistory[ramHistory.length - 1];
  const currentNetIn = netInHistory[netInHistory.length - 1];
  const currentNetOut = netOutHistory[netOutHistory.length - 1];

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#15171e] p-5 rounded-xl border border-white/5 shadow-md">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest leading-none">
            {onBack && (
              <button
                onClick={onBack}
                className="hover:text-white transition-all cursor-pointer font-sans normal-case text-indigo-400 font-semibold flex items-center mr-2 leading-none"
              >
                ← INSTANCES LIST
              </button>
            )}
            <span>Node</span>
            <span>/</span>
            <span className="text-white mt-0.5 uppercase tracking-tighter truncate max-w-[120px]">{instance.id}</span>
            <span>/</span>
            <span className="text-emerald-400">{activeTab} node</span>
          </div>

          <div className="flex items-center gap-3">
            <h2 className="text-lg font-display text-white font-medium tracking-tight">
              {instance.name}
            </h2>
            {getStatusBadge()}
          </div>
        </div>

        {/* Global actions */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button 
            type="button"
            onClick={handleStart}
            disabled={status === "running" || status === "starting" || status === "stopping"}
            className="flex-1 md:flex-none justify-center px-4 py-1.5 bg-[#10b981] hover:bg-emerald-500 disabled:bg-emerald-500/10 disabled:text-[#10b981]/30 rounded-lg text-white font-semibold text-xs tracking-wide uppercase transition-all flex items-center gap-1.5 disabled:cursor-not-allowed select-none cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Start
          </button>
          
          <button 
            type="button"
            onClick={handleRestart}
            disabled={status === "stopped" || status === "starting" || status === "stopping"}
            className="flex-1 md:flex-none justify-center px-4 py-1.5 bg-[#1e212b] hover:bg-neutral-850 disabled:bg-[#1e212b]/20 disabled:text-gray-600 rounded-lg text-white border border-white/5 font-semibold text-xs tracking-wide uppercase transition-all flex items-center gap-1.5 disabled:cursor-not-allowed select-none cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
            Restart
          </button>

          <button 
            type="button"
            onClick={handleStop}
            disabled={status === "stopped" || status === "starting" || status === "stopping"}
            className="flex-1 md:flex-none justify-center px-4 py-1.5 bg-[#ef4444] hover:bg-[#ef4444]/90 disabled:bg-[#ef4444]/10 disabled:text-red-500/30 rounded-lg text-white font-semibold text-xs tracking-wide uppercase transition-all flex items-center gap-1.5 disabled:cursor-not-allowed select-none cursor-pointer"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            Stop
          </button>
        </div>
      </div>

      {/* 2. Success dynamic Toast Banner */}
      {successToast && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 rounded-lg text-xs font-semibold flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 shrink-0" />
          {successToast}
        </div>
      )}

      {/* 3. Sub-Navigation Tabs mimicking real dashboard lists */}
      <div className="flex border-b border-white/5 gap-1.5 overflow-x-auto pb-px select-none scrollbar-thin">
        {[
          { id: "console", label: "Console Workspace", icon: Terminal },
          { id: "files", label: "File Manager", icon: Folder },
          { id: "plugins", label: "Plugins Directory", icon: Sliders },
          { id: "databases", label: "SQL Databases", icon: Database },
          { id: "schedules", label: "Cron Schedules", icon: Calendar },
          { id: "users", label: "Subusers Admin", icon: Users },
          { id: "backups", label: "Backups Snaps", icon: HardDrive },
          { id: "network", label: "Port network", icon: Link },
          { id: "startup", label: "Startup Tuning", icon: FileCode },
          { id: "settings", label: "Settings Setup", icon: Settings }
        ].map((tab) => (
          <button
            key={tab.id}
            id={`tab-console-${tab.id}`}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-2 text-[10px] font-mono uppercase font-bold tracking-wider transition-all border-b-2 cursor-pointer flex items-center gap-1.5 shrink-0 select-none ${
              activeTab === tab.id
                ? "text-indigo-400 border-indigo-500 font-semibold"
                : "text-gray-400 hover:text-white border-transparent"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5 shrink-0 text-gray-500 group-hover:text-white" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* 4. Active Tab Workspace container */}
      <div className="space-y-6">
        
        {/* TAB 1: Console workspace */}
        {activeTab === "console" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Sparklines Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#15171e] p-4 rounded-xl border border-white/5 flex items-center justify-between shadow-xs select-none">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest block leading-none">CPU Utilization</span>
                  <span className="text-sm font-semibold text-white font-mono block leading-none mt-1">
                    {currentCpu}% <span className="text-[10px] text-gray-500">/ {instance.cpuLimitPercent}%</span>
                  </span>
                </div>
                {renderSparkline(cpuHistory, "text-emerald-400")}
              </div>

              <div className="bg-[#15171e] p-4 rounded-xl border border-white/5 flex items-center justify-between shadow-xs select-none">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest block leading-none">RAM Usage Limit</span>
                  <span className="text-sm font-semibold text-white font-mono block leading-none mt-1">
                    {(currentRam / 1024).toFixed(2)} GB <span className="text-[10px] text-gray-500">/ {(instance.memoryLimitMB / 1024).toFixed(0)} GB</span>
                  </span>
                </div>
                {renderSparkline(ramHistory, "text-amber-500")}
              </div>

              <div className="bg-[#15171e] p-4 rounded-xl border border-white/5 flex items-center justify-between shadow-xs select-none font-mono">
                <div className="space-y-1 leading-none">
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">Bandwidth Ingress</span>
                  <span className="text-xs font-semibold text-white mt-1.5 block">
                    <ArrowDownLeft className="w-3 h-3 text-emerald-400 inline mr-1" /> {currentNetIn.toFixed(2)} MB/s
                  </span>
                </div>
                {renderSparkline(netInHistory, "text-indigo-400")}
              </div>

              <div className="bg-[#15171e] p-4 rounded-xl border border-white/5 flex items-center justify-between shadow-xs select-none font-mono">
                <div className="space-y-1 leading-none">
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">Bandwidth Egress</span>
                  <span className="text-xs font-semibold text-white mt-1.5 block">
                    <ArrowUpRight className="w-3 h-3 text-red-500 inline mr-1" /> {currentNetOut.toFixed(2)} MB/s
                  </span>
                </div>
                {renderSparkline(netOutHistory, "text-pink-500")}
              </div>
            </div>

            {/* Pseudo terminal box */}
            <div className="bg-[#0c0d12] rounded-xl border border-white/5 shadow-inner flex flex-col overflow-hidden">
              <div className="bg-[#15171e] px-4 py-2.5 border-b border-white/5 flex justify-between items-center select-none">
                <div className="flex items-center gap-2 text-gray-400">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[11px] font-mono font-medium tracking-tight">root@skypanel-node:{instance.id}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500/60" />
                  <span className="w-2 h-2 rounded-full bg-amber-500/60" />
                  <span className="w-2 h-2 rounded-full bg-emerald-500/60" />
                </div>
              </div>

              {/* Console log list streams */}
              <div className="h-96 overflow-y-auto p-4 font-mono text-xs text-[#9ca3af] space-y-1.5 bg-[#0d0e12]/80 leading-relaxed scrollbar-thin shadow-inner select-text">
                {logs.length === 0 ? (
                  <div className="text-gray-600 italic py-8 text-center flex items-center justify-center gap-2">
                    <ServerCrash className="w-5 h-5 text-gray-600" />
                    Container is unmounted. Toggle "Start" to bootstrap Docker resources.
                  </div>
                ) : (
                  logs.map((log, index) => {
                    if (!log || typeof log !== "string") return null;
                    let color = "text-[#9ca3af]";
                    if (log.includes("[System]") || log.includes("[Docker")) color = "text-indigo-400/90";
                    else if (log.includes("[SpigotLoader]") || log.includes("[Skypanel")) color = "text-emerald-400";
                    else if (log.includes("[Minecraft") || log.includes("[Logger]")) color = "text-amber-400";
                    else if (log.startsWith("root@") || log.includes("root@skypanel")) color = "text-emerald-350 font-semibold";
                    else if (log.includes("Error") || log.includes("aborted") || log.includes("REJECTED")) color = "text-rose-450 font-semibold";
                    return (
                      <div key={index} className={`${color} whitespace-pre-wrap select-all font-mono break-all`}>
                        {log}
                      </div>
                    );
                  })
                )}
                <div ref={terminalEndRef} />
              </div>

              {/* Command Prompt Form */}
              <form onSubmit={handleSendCommand} className="border-t border-white/5 bg-[#15171e] px-4 py-2 flex items-center gap-3 select-none">
                <span className="font-mono text-xs text-emerald-400 font-bold">&gt;_</span>
                <input
                  type="text"
                  placeholder="Send a server CLI stream command... (Try 'help', 'list', 'plugins', 'vitals')"
                  value={commandInput}
                  onChange={(e) => setCommandInput(e.target.value)}
                  className="flex-1 bg-transparent border-none text-xs outline-hidden text-white font-mono placeholder-gray-600 focus:ring-0 px-1 py-1"
                />
                <button
                  type="submit"
                  className="p-1 px-3 bg-emerald-500 hover:bg-emerald-450 text-white rounded-md text-[10px] font-mono uppercase font-bold flex items-center gap-1 transition-colors select-none cursor-pointer"
                >
                  SEND <Send className="w-3 h-3" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: File Manager */}
        {activeTab === "files" && (
          <div className="space-y-4 animate-fadeIn font-sans">
            <div className="flex justify-between items-center bg-[#15171e] p-4 rounded-xl border border-white/5">
              <div className="flex items-center gap-2 font-mono text-[11px] text-gray-400">
                <span className="text-indigo-400 shrink-0">PATH:</span>
                <span className="bg-black/30 px-2 py-1 rounded border border-white/5 font-semibold text-white select-all">
                  {currentPath}
                </span>
                {currentPath !== "/home/container" && (
                  <button 
                    onClick={handleNavigateUp}
                    className="px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 font-sans text-xs rounded border border-white/5 ml-2 cursor-pointer text-white"
                  >
                    Parent Dir ↑
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCreateDirectory}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-750 text-white border border-white/5 text-[10px] font-mono uppercase font-bold rounded-lg flex items-center gap-1 shadow-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-indigo-400" /> New Folder
                </button>
                <button
                  onClick={() => handleOpenFileEditor("unnamed.txt", "", true)}
                  className="px-3 py-1.5 bg-indigo-650 hover:bg-indigo-550 text-white text-[10px] font-mono uppercase font-bold rounded-lg flex items-center gap-1 shadow-md cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Create File
                </button>
              </div>
            </div>

            {/* Files List Table */}
            <div className="bg-[#15171e] rounded-xl border border-white/5 overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse text-xs select-none">
                <thead>
                  <tr className="bg-[#0b0c10] border-b border-white/5 text-gray-500 font-mono text-[10px]">
                    <th className="px-5 py-3 font-semibold uppercase tracking-wider">File Name</th>
                    <th className="px-5 py-3 font-semibold uppercase tracking-wider">Type</th>
                    <th className="px-5 py-3 font-semibold uppercase tracking-wider">Size</th>
                    <th className="px-5 py-3 font-semibold uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/4 text-gray-300">
                  {getDirContents().map((f) => (
                    <tr key={f.name} className="hover:bg-white/2 transition-all">
                      <td className="px-5 py-3 font-sans">
                        {f.type === "directory" ? (
                          <button
                            onClick={() => handleNavigateFolder(f.name)}
                            className="flex items-center gap-2.5 font-semibold text-indigo-400 hover:text-indigo-300 text-left transition-colors cursor-pointer"
                          >
                            <Folder className="w-4 h-4 fill-indigo-400/20 text-indigo-400 shrink-0" />
                            {f.name}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenFileEditor(f.name, f.content || "# Binary file payload", false)}
                            className="flex items-center gap-2.5 font-mono text-gray-200 hover:text-emerald-450 text-left transition-colors cursor-pointer text-xs"
                          >
                            <FileText className="w-4 h-4 text-gray-500 shrink-0" />
                            {f.name}
                          </button>
                        )}
                      </td>
                      <td className="px-5 py-3 font-mono text-[10px] text-gray-500 uppercase">
                        {f.type}
                      </td>
                      <td className="px-5 py-3 font-mono text-[10px] text-gray-400">
                        {f.type === "directory" ? "--" : f.size || "1.0 KB"}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex justify-end gap-1.5">
                          {f.type === "file" && (
                            <button
                              onClick={() => handleOpenFileEditor(f.name, f.content || "", false)}
                              className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-gray-300 text-[10px] font-mono border border-white/5 rounded-md cursor-pointer"
                            >
                              Edit
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteFile(f.name)}
                            className="p-1 text-gray-500 hover:text-red-400 cursor-pointer"
                            title="Purge File"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {getDirContents().length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-gray-600 italic">
                        Empty Directory Path.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Advanced File Visual Editor Modal */}
            {showFileModal && (
              <div className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                <div className="bg-[#11121d] border border-white/10 w-full max-w-3xl p-6 rounded-2xl shadow-2xl flex flex-col h-[500px]">
                  <div className="flex justify-between items-center border-b border-white/5 pb-3 font-mono">
                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block">File Visual Editor Workspace</span>
                      <input
                        type="text"
                        value={editingFileName}
                        disabled={!isCreatingNewFile}
                        onChange={(e) => setEditingFileName(e.target.value)}
                        placeholder="file_name.properties"
                        className="bg-[#0c0d12] border border-white/10 rounded px-2 py-1 text-xs text-white max-w-xs focus:outline-hidden text-emerald-400 font-semibold"
                      />
                    </div>
                    <span className="text-[10px] text-gray-500">Path: {currentPath}</span>
                  </div>

                  <div className="flex-1 my-4 bg-black rounded-lg border border-white/5 overflow-hidden flex flex-col">
                    <textarea
                      value={editingFileContent}
                      onChange={(e) => setEditingFileContent(e.target.value)}
                      placeholder="# Enter system configuration files content here..."
                      className="w-full flex-1 bg-[#09090d] border-none text-white font-mono text-xs p-4 focus:ring-0 resize-none outline-hidden"
                    />
                  </div>

                  <div className="flex justify-end gap-3 select-none">
                    <button
                      onClick={() => setShowFileModal(false)}
                      className="px-4 py-2 bg-neutral-800 text-gray-400 hover:text-white rounded-lg text-xs cursor-pointer font-sans font-semibold"
                    >
                      Close Editor
                    </button>
                    <button
                      onClick={handleSaveFile}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-450 text-white rounded-lg text-xs cursor-pointer font-mono font-bold uppercase tracking-wider"
                    >
                      Commit Save File
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Plugins Installer */}
        {activeTab === "plugins" && (
          <div className="space-y-6 animate-fadeIn font-sans">
            <div className="bg-[#15171e] p-5 rounded-xl border border-white/5">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                System Plugin Repository Marketplace
              </h3>
              <p className="text-xs text-gray-400 font-sans mt-0.5">
                Install and manage loaded compiled files on this sandbox server. Any plugin uploaded via the Admin Portal will dynamically pop-up here!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plugins.map((pl) => {
                const isInstalled = (installedPlugins || []).includes(pl.id);
                return (
                  <div key={pl.id} className="bg-[#15171e] p-5 rounded-xl border border-white/5 flex flex-col justify-between shadow-xs">
                    <div className="space-y-3">
                      <div className="flex gap-3.5 items-start">
                        <img
                          src={(pl.imageUrl || "https://images.unsplash.com/photo-1607988795691-3d0147b43231?w=100&h=100&fit=crop") || undefined}
                          alt={pl.name}
                          className="w-11 h-11 rounded-lg object-cover bg-black border border-white/10 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-gray-200 truncate">{pl.name}</h4>
                          <span className="font-mono text-[9px] text-gray-500 block leading-tight">
                            {pl.version} by <strong className="text-indigo-400 font-medium">{pl.author}</strong>
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed font-sans mt-2">
                        {pl.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-white/5 mt-4 flex justify-between items-center text-xs">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-mono text-[9px] text-gray-500 italic block">
                          File: {pl.fileName || `${pl.id}.jar`}
                        </span>
                        {pl.sourceType === "download_link" ? (
                          <span className="text-[8px] text-amber-500/80 font-mono flex items-center gap-0.5" title={pl.downloadUrl}>
                            <span className="w-1 h-1 rounded-full bg-amber-500 animate-ping" /> Remote link stream fetch
                          </span>
                        ) : (
                          <span className="text-[8px] text-indigo-400/85 font-mono flex items-center gap-0.5">
                            Local Node binary copy
                          </span>
                        )}
                      </div>

                      {isInstalled ? (
                        <div className="flex gap-2">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-mono tracking-wider uppercase font-bold">
                            <Check className="w-3 h-3 text-emerald-400" /> INSTALLED
                          </span>
                          <button
                            onClick={() => handleUninstallPlugin(pl.id)}
                            className="px-2.5 py-0.5 bg-rose-950/25 border border-rose-500/10 hover:bg-rose-900/40 text-rose-400 rounded text-[9px] font-mono uppercase tracking-wide cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleInstallPlugin(pl)}
                          className="px-3 py-1 bg-indigo-650 hover:bg-indigo-550 text-white rounded text-[10px] font-mono uppercase font-bold tracking-wider cursor-pointer"
                        >
                          Install plugin
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {plugins.length === 0 && (
                <div className="col-span-full font-serif font-semibold py-12 text-center text-gray-500 italic bg-black/20 border border-dashed border-white/5 rounded-xl">
                  No globally enabled addon packages available. Specify them in the Admin Panel view.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: SQL Databases */}
        {activeTab === "databases" && (
          <div className="space-y-6 animate-fadeIn font-sans">
            <div className="bg-[#15171e] p-5 rounded-xl border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider">MySQL Container Database Sync</h3>
                <p className="text-xs text-gray-400">Instantly provision decoupled MySQL SQL layers mapped to this physical cluster.</p>
              </div>

              <form onSubmit={handleCreateDatabase} className="w-full md:w-auto flex gap-2">
                <input
                  type="text"
                  placeholder="db_name (e.g. plugins_data)"
                  value={newDbName}
                  onChange={(e) => setNewDbName(e.target.value)}
                  className="bg-black border border-white/10 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-hidden font-sans placeholder-gray-600 focus:border-indigo-500 text-xs"
                  required
                />
                <button
                  type="submit"
                  className="px-3 bg-indigo-650 hover:bg-indigo-550 text-white text-[10px] font-mono tracking-wider uppercase font-bold rounded-lg cursor-pointer shrink-0"
                >
                  Create DB
                </button>
              </form>
            </div>

            {/* Databases list table */}
            <div className="bg-[#15171e] rounded-xl border border-white/5 overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse text-xs select-none font-mono">
                <thead>
                  <tr className="bg-[#0b0c10] border-b border-white/5 text-gray-500 font-mono text-[10px]">
                    <th className="px-5 py-3 font-semibold uppercase tracking-wider">Database Name</th>
                    <th className="px-5 py-3 font-semibold uppercase tracking-wider">Username</th>
                    <th className="px-5 py-3 font-semibold uppercase tracking-wider">Host Node</th>
                    <th className="px-5 py-3 font-semibold uppercase tracking-wider">Connection limits</th>
                    <th className="px-5 py-3 font-semibold uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/4 text-gray-300">
                  {databases.map((db) => (
                    <tr key={db.id} className="hover:bg-white/2 transition-all">
                      <td className="px-5 py-3.5 font-bold font-sans text-gray-100">{db.name}</td>
                      <td className="px-5 py-3.5 text-gray-300 select-all">{db.user}</td>
                      <td className="px-5 py-3.5 text-gray-200 select-all">{db.host}:3306</td>
                      <td className="px-5 py-3.5 text-gray-500 font-semibold">{db.maxConnections} max</td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => handleDeleteDatabase(db.id, db.name)}
                          className="px-2 py-1 bg-red-950/25 border border-red-500/10 text-red-400 hover:text-white rounded-md text-[9px] uppercase tracking-wide cursor-pointer font-sans font-bold"
                        >
                          De-allocate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: Schedules */}
        {activeTab === "schedules" && (
          <div className="space-y-6 animate-fadeIn font-sans">
            <div className="bg-[#15171e] p-5 rounded-xl border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-0.5">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Daemon Cron Job Scheduler</h3>
                <p className="text-xs text-gray-400">Automate backups, restarts, and CLI signals on physical intervals.</p>
              </div>

              <form onSubmit={handleAddSchedule} className="w-full md:w-auto flex flex-wrap gap-2">
                <input
                  type="text"
                  placeholder="Task Name (e.g. Daily Save)"
                  value={scheduleName}
                  onChange={(e) => setScheduleName(e.target.value)}
                  className="bg-black border border-white/10 rounded-lg py-1 px-3 text-xs text-white focus:outline-hidden font-sans placeholder-gray-600 focus:border-indigo-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Cron (e.g. 0 12 * * *)"
                  value={scheduleCron}
                  onChange={(e) => setScheduleCron(e.target.value)}
                  className="bg-black border border-white/10 rounded-lg py-1 px-3 text-xs text-white focus:outline-hidden font-mono placeholder-gray-600 focus:border-indigo-500 w-28"
                  required
                />
                <button
                  type="submit"
                  className="px-3 bg-indigo-650 hover:bg-indigo-550 text-white text-[10px] font-mono tracking-wider uppercase font-bold rounded-lg cursor-pointer"
                >
                  Create Schedule
                </button>
              </form>
            </div>

            <div className="bg-[#15171e] rounded-xl border border-white/5 overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse text-xs select-none">
                <thead>
                  <tr className="bg-[#0b0c10] border-b border-white/5 text-gray-500 font-mono text-[10px]">
                    <th className="px-5 py-3 font-semibold uppercase tracking-wider">Schedule Name</th>
                    <th className="px-5 py-3 font-semibold uppercase tracking-wider">Cron Interval</th>
                    <th className="px-5 py-3 font-semibold uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3 font-semibold uppercase tracking-wider">Last Run</th>
                    <th className="px-5 py-3 font-semibold uppercase tracking-wider text-right font-mono">ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/4 text-gray-300">
                  {schedules.map((sc) => (
                    <tr key={sc.id} className="hover:bg-white/2 transition-all">
                      <td className="px-5 py-3.5 font-sans font-semibold text-gray-200">{sc.name}</td>
                      <td className="px-5 py-3.5 font-mono text-xs text-[#10b981]">{sc.expression}</td>
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-mono uppercase font-bold">Active</span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 font-mono text-[10px]">{sc.lastRun}</td>
                      <td className="px-5 py-3.5 text-right font-mono text-[10px] text-gray-600">{sc.id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: Subusers */}
        {activeTab === "users" && (
          <div className="space-y-6 animate-fadeIn font-sans">
            <div className="bg-[#15171e] p-5 rounded-xl border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-0.5">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Server Subuser Access Controls</h3>
                <p className="text-xs text-gray-400 font-sans">Grant specific collaborators secure credentials to supervise backend systems.</p>
              </div>

              <form onSubmit={handleInviteSubuser} className="w-full md:w-auto flex flex-wrap gap-2">
                <input
                  type="email"
                  placeholder="collaborator@domain.com"
                  value={subuserEmail}
                  onChange={(e) => setSubuserEmail(e.target.value)}
                  className="bg-black border border-white/10 rounded-lg py-1 px-3 text-xs text-white focus:outline-hidden font-sans placeholder-gray-600 focus:border-indigo-500 text-xs"
                  required
                />
                <select
                  value={subuserRole}
                  onChange={(e) => setSubuserRole(e.target.value)}
                  className="bg-black border border-white/10 rounded-lg py-1 px-3 text-xs text-white focus:outline-hidden font-sans cursor-pointer placeholder-gray-600"
                >
                  <option value="Administrator">Administrator</option>
                  <option value="Developer">Developer</option>
                  <option value="Moderator">Moderator</option>
                </select>
                <button
                  type="submit"
                  className="px-3 bg-indigo-650 hover:bg-indigo-550 text-white text-[10px] font-mono tracking-wider uppercase font-bold rounded-lg cursor-pointer"
                >
                  Invite Subuser
                </button>
              </form>
            </div>

            <div className="bg-[#15171e] rounded-xl border border-white/5 overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse text-xs select-none">
                <thead>
                  <tr className="bg-[#0b0c10] border-b border-white/5 text-gray-500 font-mono text-[10px]">
                    <th className="px-5 py-3 font-semibold uppercase tracking-wider">Email Profile</th>
                    <th className="px-5 py-3 font-semibold uppercase tracking-wider">Assigned Role</th>
                    <th className="px-5 py-3 font-semibold uppercase tracking-wider">Allocated Rights</th>
                    <th className="px-5 py-3 font-semibold uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/4 text-gray-300">
                  {subusers.map((sb) => (
                    <tr key={sb.id} className="hover:bg-white/2 transition-all">
                      <td className="px-5 py-3.5 font-semibold text-gray-150 select-all">{sb.email}</td>
                      <td className="px-5 py-3.5 font-semibold text-xs text-indigo-400">{sb.role}</td>
                      <td className="px-5 py-3.5 flex flex-wrap gap-1 font-mono text-[9px] h-12 items-center">
                        {sb.perms.map((p) => (
                          <span key={p} className="bg-black/40 px-1.5 py-0.5 rounded border border-white/5 select-all">{p}</span>
                        ))}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => {
                            setSubusers((prev) => prev.filter((u) => u.id !== sb.id));
                            triggerToast(`Access deauthorized for ${sb.email}`);
                          }}
                          className="text-gray-500 hover:text-red-400 cursor-pointer"
                        >
                          Revoke Access
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 7: Backups SNAPSHOT */}
        {activeTab === "backups" && (
          <div className="space-y-6 animate-fadeIn font-sans">
            <div className="bg-[#15171e] p-5 rounded-xl border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-0.5">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Encrypted Node Backups Engine</h3>
                <p className="text-xs text-gray-400">Trigger military-grade snaps stored securely on decentralized storage layers.</p>
              </div>

              <button
                type="button"
                onClick={handleTriggerBackup}
                disabled={isCreatingBackup}
                className="px-4 py-2 bg-indigo-650 hover:bg-indigo-550 border border-transparent disabled:bg-indigo-950 disabled:text-indigo-600 text-white text-[10px] font-mono tracking-wider uppercase font-bold rounded-lg flex items-center gap-1 shadow-md cursor-pointer disabled:cursor-not-allowed"
              >
                {isCreatingBackup ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Compiling Backup Chunks...
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" /> Initialize Snap Backup
                  </>
                )}
              </button>
            </div>

            {/* Backups progress bar indication */}
            {isCreatingBackup && (
              <div className="bg-[#15171e] p-4 rounded-xl border border-indigo-500/10 space-y-2">
                <div className="flex justify-between items-center text-xs font-mono font-bold">
                  <span className="text-indigo-400 animate-pulse uppercase">Packaging world regions & plugin.jar...</span>
                  <span className="text-white">{backupProgress}%</span>
                </div>
                <div className="w-full bg-black h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-550 h-full transition-all duration-300" style={{ width: `${backupProgress}%` }} />
                </div>
              </div>
            )}

            <div className="bg-[#15171e] rounded-xl border border-white/5 overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse text-xs select-none">
                <thead>
                  <tr className="bg-[#0b0c10] border-b border-white/5 text-gray-500 font-mono text-[10px]">
                    <th className="px-5 py-3 font-semibold uppercase tracking-wider">Archive Name</th>
                    <th className="px-5 py-3 font-semibold uppercase tracking-wider">Data Payload Size</th>
                    <th className="px-5 py-3 font-semibold uppercase tracking-wider">Encryption Hash</th>
                    <th className="px-5 py-3 font-semibold uppercase tracking-wider">Created at</th>
                    <th className="px-5 py-3 font-semibold uppercase tracking-wider text-right font-mono">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/4 text-gray-300 font-mono text-[11px]">
                  {backups.map((bk) => (
                    <tr key={bk.id} className="hover:bg-white/2 transition-all">
                      <td className="px-5 py-3.5 font-sans font-semibold text-gray-200 select-all">{bk.name}</td>
                      <td className="px-5 py-3.5 text-gray-300">{bk.size}</td>
                      <td className="px-5 py-3.5 text-gray-500 text-[10px] select-all">{bk.checksum}</td>
                      <td className="px-5 py-3.5 text-gray-500 text-[10px]">{bk.createdAt.slice(0, 16).replace("T", " ")}</td>
                      <td className="px-5 py-3.5 text-right font-sans">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 text-[9px] uppercase font-bold">Encrypted</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 8: Secondary Network mappings */}
        {activeTab === "network" && (
          <div className="space-y-6 animate-fadeIn font-sans">
            <div className="bg-[#15171e] p-5 rounded-xl border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-0.5">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Virtual Port Allocations Map</h3>
                <p className="text-xs text-gray-400">Map internal ports inside the container (e.g. Dynmap `8123` or voice servers).</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const newPortVal = 25565 + 100 + Math.floor(Math.random() * 500);
                  const newNet = {
                    id: `net_${Math.random().toString(36).substring(2,6)}`,
                    port: newPortVal,
                    ip: instance.ip,
                    isPrimary: false,
                    label: `Secondary Allocated Port - Mapped inside hyper socket`
                  };
                  setNetworks((prev) => [...prev, newNet]);
                  
                  if (status === "running") {
                    setLogs((prev) => [...prev, `[Docker-Proxy] Mapping host port ${newPortVal} successfully onto Node container socket.`]);
                  }

                  triggerToast(`Mapped network socket onto port: ${newPortVal}`);
                }}
                className="px-4 py-2 bg-indigo-650 hover:bg-indigo-550 text-white text-[10px] font-mono tracking-wider uppercase font-bold rounded-lg flex items-center gap-1 cursor-pointer shadow-md"
              >
                <Plus className="w-3.5 h-3.5" /> Allocate New Socket Port
              </button>
            </div>

            <div className="bg-[#15171e] rounded-xl border border-white/5 overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse text-xs select-none font-mono">
                <thead>
                  <tr className="bg-[#0b0c10] border-b border-white/5 text-gray-500 font-mono text-[10px]">
                    <th className="px-5 py-3 font-semibold uppercase tracking-wider">Socket Bind Address</th>
                    <th className="px-5 py-3 font-semibold uppercase tracking-wider">Designated Port</th>
                    <th className="px-5 py-3 font-semibold uppercase tracking-wider">Socket Description / Flag</th>
                    <th className="px-5 py-3 font-semibold uppercase tracking-wider text-right font-sans">Label</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/4 text-gray-300">
                  {networks.map((nt) => (
                    <tr key={nt.id} className="hover:bg-white/2 transition-all">
                      <td className="px-5 py-3.5 font-mono select-all text-gray-400">{nt.ip}</td>
                      <td className="px-5 py-3.5 font-bold font-mono text-gray-100 text-xs">{nt.port}</td>
                      <td className="px-5 py-3.5">
                        {nt.isPrimary ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] uppercase font-bold shrink-0">PRIMARY INTERGRESS</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-[#1e212b] text-[#9ca3af] border border-white/5 text-[9px] uppercase font-bold font-mono shrink-0">ROUTED PROXY GATEWAY</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right font-sans text-xs text-gray-500 font-medium">{nt.label}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 9: Startup Tuning */}
        {activeTab === "startup" && (
          <div className="space-y-6 animate-fadeIn font-sans">
            <div className="bg-[#15171e] p-5 rounded-xl border border-white/5 space-y-1">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Startup Commands & Java Tuning Engine</h3>
              <p className="text-xs text-gray-400">Calibrate thread execution flags, JVM GC algorithms, and Egg variables.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left JVM Command Column */}
              <div className="bg-[#15171e] p-6 rounded-xl border border-white/5 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block leading-none">Command Line Constructor</label>
                  <p className="text-[11px] text-gray-500 leading-none">Automated system JVM executor compiled dynamically upon startup.</p>
                </div>
                <div className="bg-black/40 p-3.5 rounded-lg border border-white/5 font-mono text-xs text-emerald-400 font-bold select-all whitespace-pre-wrap leading-relaxed">
                  java -Xms128M -Xmx{(instance.memoryLimitMB).toFixed(0)}M -XX:+UseG1GC -XX:+ParallelRefProcEnabled -XX:+UnlockExperimentalVMOptions -jar {(instance.eggName || "").includes("Spigot") ? "server.jar" : "runtime.js"}
                </div>
              </div>

              {/* Startup parameters column */}
              <div className="bg-[#15171e] p-6 rounded-xl border border-white/5 space-y-4 font-sans text-xs">
                <div className="space-y-1.5 border-b border-white/5 pb-2.5">
                  <h4 className="text-xs font-bold text-gray-200 uppercase">Interactive Environment Variables</h4>
                  <p className="text-[11px] text-gray-500 leading-none">Dynamic mappings forwarded directly to Docker config layers.</p>
                </div>

                <div className="space-y-3.5">
                  <div className="flex justify-between items-center bg-black/20 p-2.5 rounded-xl border border-white/5">
                    <div>
                      <span className="block font-bold text-gray-300">SERVER_JARFILE</span>
                      <span className="text-[10px] text-gray-500 font-sans mt-0.5">Executor file mapping target</span>
                    </div>
                    <span className="font-mono bg-[#1e212b] px-2.5 py-1 text-white border border-white/5 rounded">server.jar</span>
                  </div>

                  <div className="flex justify-between items-center bg-black/20 p-2.5 rounded-xl border border-white/5">
                    <div>
                      <span className="block font-bold text-gray-300">SERVER_VERSION</span>
                      <span className="text-[10px] text-gray-500 font-sans mt-0.5">Jar compilation mapping</span>
                    </div>
                    <span className="font-mono bg-[#1e212b] px-2.5 py-1 text-white border border-white/5 rounded">1.20.4-Latest</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 10: Settings Setup */}
        {activeTab === "settings" && (
          <div className="space-y-6 animate-fadeIn font-sans">
            <div className="bg-[#15171e] p-5 rounded-xl border border-white/5 space-y-1">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Calibration & Actions Control Hub</h3>
              <p className="text-xs text-gray-400">Reinstall containers, override brand credentials, or coordinate SFTP mappings.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* SFTP/Reinstall credentials */}
              <div className="bg-[#15171e] p-6 rounded-xl border border-white/5 space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">SFTP Socket Credentials</h4>
                
                <div className="space-y-3 font-sans text-xs">
                  <div className="space-y-1">
                    <span className="text-gray-500 uppercase font-bold text-[10px] tracking-widest block leading-none">SFTP Host Socket Bound</span>
                    <span className="font-mono text-white text-xs select-all block mt-0.5 font-bold">sftp://{instance.ip}:2022</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-gray-500 uppercase font-bold text-[10px] tracking-widest block leading-none">SFTP Username</span>
                    <span className="font-mono text-white text-xs select-all block mt-0.5 font-bold">root.{instance.id}</span>
                  </div>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => triggerToast("SFTP verification key password has been rebuilt.")}
                      className="px-3.5 py-1.5 bg-neutral-800 hover:bg-[#1e212b] text-white border border-white/5 text-[10px] font-mono uppercase font-bold tracking-wider rounded-lg cursor-pointer"
                    >
                      Rebuild SFTP Password
                    </button>
                  </div>
                </div>
              </div>

              {/* Server Details setting rename */}
              <div className="bg-[#15171e] p-6 rounded-xl border border-white/5 space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">Modify Container Identity</h4>
                
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-gray-500 uppercase font-bold text-[10px] tracking-widest block leading-none">Update Instance Title</label>
                    <input
                      type="text"
                      className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-xs text-white focus:outline-hidden mt-1.5 font-sans"
                      value={serverNameInput}
                      onChange={(e) => setServerNameInput(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[#a5b4fc] uppercase font-bold text-[10px] tracking-widest block leading-none">Server Banner / Logo URL</label>
                    <input
                      type="text"
                      className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-xs text-white focus:outline-hidden mt-1.5 font-sans"
                      placeholder="Paste image URL here..."
                      value={serverBgUrlInput}
                      onChange={(e) => setServerBgUrlInput(e.target.value)}
                    />
                    <span className="text-[10px] text-gray-500 block leading-tight mt-1">This sets the immersive graphic background representing this node container across lists.</span>
                  </div>

                  {/* Quick Preset Images */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block leading-none">Preset Designs (Background Logos)</span>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { name: "Minecraft Active", url: "https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=600&auto=format&fit=crop&q=60" },
                        { name: "Engine Core", url: "https://images.unsplash.com/photo-1607988795691-3d0147b43231?w=600&auto=format&fit=crop&q=60" },
                        { name: "Minimal Abstract", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=60" },
                        { name: "Dark Modern Matrix", url: "https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=600&auto=format&fit=crop&q=60" }
                      ].map((preset, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setServerBgUrlInput(preset.url)}
                          className="px-2 py-1 bg-[#1e212b] hover:bg-indigo-650 text-gray-300 hover:text-white rounded text-[10px] border border-white/5 cursor-pointer leading-none transition-colors"
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (!serverNameInput.trim()) return;
                        if (onUpdateInstance) {
                          onUpdateInstance({
                            ...instance,
                            name: serverNameInput.trim(),
                            bgImageUrl: serverBgUrlInput.trim()
                          });
                        } else {
                          // Fallback mutation
                          instance.name = serverNameInput.trim();
                          instance.bgImageUrl = serverBgUrlInput.trim();
                        }
                        triggerToast(`Server identity renamed & logo updated successfully.`);
                      }}
                      className="px-4 py-2 bg-indigo-650 hover:bg-indigo-550 text-white text-[10px] font-mono uppercase font-bold tracking-wider rounded-lg flex items-center gap-1 cursor-pointer shadow-md"
                    >
                      <Check className="w-3.5 h-3.5" /> Apply Settings Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
