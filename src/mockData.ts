/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  SystemUser,
  GameInstance,
  PhysicalNode,
  DockerImage,
  APIKey,
  AuditLog,
  PluginExtension,
  PanelSettings
} from "./types";

export const initialCurrentUser: SystemUser = {
  id: "6d0370",
  username: "root",
  email: "admin@skyport.alt",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces",
  role: "Administrator",
  isVerified: true,
  createdAt: "2026-01-10T14:32:00Z",
  has2FA: false
};

export const initialUsersList: SystemUser[] = [
  initialCurrentUser
];

export const initialNodesList: PhysicalNode[] = [
  {
    id: "node_dal01",
    name: "Dallas AMD EPYC Core 01",
    ip: "172.96.12.100",
    daemonPort: 8080,
    ramMaxMB: 65536,
    ramAllocatedMB: 4096,
    diskLimitGB: 1024,
    diskAllocatedGB: 20,
    cpuCores: 16,
    tags: ["nvme", "us-central", "prod"]
  }
];

export const initialInstancesList: GameInstance[] = [];

export const initialDockerImages: DockerImage[] = [
  {
    id: "img_mc_spigot",
    name: "Minecraft Spigot Base",
    tag: "java17-latest",
    category: "Minecraft Platforms",
    repo: "ghcr.io/pterodactyl/yolks:java_17",
    description: "Standard high performance Spigot server environment with pre-validated Java 17 setups."
  },
  {
    id: "img_mc_paper",
    name: "Minecraft PaperMC",
    tag: "java17-latest",
    category: "Minecraft Platforms",
    repo: "ghcr.io/pterodactyl/yolks:java_17",
    description: "Optimized vanilla game server image using high-performance Paper software."
  },
  {
    id: "img_nodejs20",
    name: "NodeJS 20 Run",
    tag: "node20-alpine",
    category: "Linux App Engines",
    repo: "ghcr.io/pterodactyl/yolks:node_20",
    description: "Ultra lightweight Node.js v20 execution layer with git, curl, and package-installer bindings."
  }
];

export const initialAPIKeys: APIKey[] = [
  {
    id: "api_key_01",
    name: "Discord-Bot-Auto-Billing",
    key: "aeth_pk_f93j2a01sl47820ka983s...",
    permissions: ["Read Instances", "Write Instances", "Trigger Power Actions"],
    createdAt: "2026-04-12T08:30:00Z",
    lastUsed: "2026-05-25T03:14:10Z"
  }
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: "log_01",
    userId: "6d0370",
    username: "root",
    action: "INSTANCE_CREATED",
    ipAddress: "198.51.100.42",
    details: "Successfully initialized GameInstance: 'Minecraft Community Server' on Dallas AMD EPYC Core 01.",
    timestamp: "2026-05-24T18:32:10Z"
  },
  {
    id: "log_02",
    userId: "6d0370",
    username: "root",
    action: "NODE_TAGS_UPDATED",
    ipAddress: "198.51.100.42",
    details: "Updated PhysicalNode 'Dallas AMD EPYC Core 01' allocation tags: Added 'nvme', Added 'us-central'.",
    timestamp: "2026-05-24T20:15:00Z"
  }
];

export const initialPlugins: PluginExtension[] = [
  {
    id: "pl_worldedit",
    name: "WorldEdit Builder",
    version: "v7.2.14",
    author: "EngineHub",
    description: "In-game map editor and schematics compiler to safely edit millions of blocks within seconds.",
    isEnabled: true,
    fileName: "worldedit-bukkit-7.2.14.jar",
    imageUrl: "https://images.unsplash.com/photo-1607988795691-3d0147b43231?w=120&h=120&fit=crop"
  },
  {
    id: "pl_essentials",
    name: "EssentialsX Utilities",
    version: "v2.20.1",
    author: "SpongeTeam",
    description: "Full suite of essential commands including warps, kits, mail, home, economics, and chat formats.",
    isEnabled: true,
    fileName: "EssentialsX-2.20.1.jar",
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=120&h=120&fit=crop"
  }
];

export const defaultSettings: PanelSettings = {
  panelName: "Skypanel",
  logoUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&h=120&fit=crop",
  allowRegistration: true,
  forceEmailVerification: false,
  smtpHost: "smtp.skyport.alt",
  smtpPort: 587,
  smtpUser: "no-reply@skyport.alt",
  smtpSecure: true,
  activeTheme: "dark"
};

export const simulatedLogPool: Record<string, string[]> = {
  "inst_mc_spigot_01": [
    "[System] Direct VM memory maps bounded to physical Dallas core 14 & 15.",
    "[Skypanel] Mounting game server runtime package directory inside Docker Sandbox...",
    "[Minecraft] Loading library library: 'net/minecraftforge/forge/1.20.4'",
    "[Minecraft] Initializing Legacy Environment Layers...",
    "[Logger] Starting Spigot Server v1.20.4-R0.1-SNAPSHOT...",
    "[Skypanel-Watcher] Core CPU allocation bindings ready. Threading 4 threads.",
    "[Skypanel-Metrics] Daemon sync completed in 24.1ms.",
    "[Minecraft] Loading properties...",
    "[Minecraft] Default game level maps bound to directory: 'world_survival'",
    "[Minecraft] Starting Minecraft server on 172.96.12.100:25565",
    "[Minecraft] Loading Bukkit configuration...",
    "[Minecraft] Spigot Level Layer config parsed: Auto-Saving: On, Thread Count: 4",
    "[Minecraft] Preparing level \"world_survival\"",
    "[Minecraft] Preparing start region for dimension minecraft:overworld",
    "[Minecraft] Loaded 1024 spawn chunks in 320ms - Status: Healthy.",
    "[Minecraft] Preparing start region for dimension minecraft:the_nether",
    "[Minecraft] Loaded 512 Nether spawn chunks in 120ms.",
    "[Minecraft] Preparing start region for dimension minecraft:the_end",
    "[Minecraft] Loaded 256 End spawn chunks in 80ms.",
    "[Skypanel-Engine] Binding port mapping [25565:25565] inside Docker socket.",
    "[System-State] Container online. TCP socket listening for incoming gamers."
  ]
};
