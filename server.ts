import express from "express";
import path from "path";
import fs from "fs/promises";
import { existsSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

// Derive directory paths supporting both ESM and CJS bundling
let currentDirName = process.cwd();
try {
  const __filename = fileURLToPath(import.meta.url);
  currentDirName = path.dirname(__filename);
} catch (e) {
  currentDirName = __dirname;
}

const DATA_DIR = path.join(process.cwd(), "data");
const SERVERS_DIR = path.join(DATA_DIR, "servers");

// Ensure base data directories exist
if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
if (!existsSync(SERVERS_DIR)) mkdirSync(SERVERS_DIR, { recursive: true });

// JSON Database Files Path definition
const FILES = {
  users: path.join(DATA_DIR, "users.json"),
  nodes: path.join(DATA_DIR, "nodes.json"),
  instances: path.join(DATA_DIR, "instances.json"),
  images: path.join(DATA_DIR, "images.json"),
  apiKeys: path.join(DATA_DIR, "api_keys.json"),
  auditLogs: path.join(DATA_DIR, "audit_logs.json"),
  plugins: path.join(DATA_DIR, "plugins.json"),
  settings: path.join(DATA_DIR, "settings.json"),
};

// Database utility functions
async function readDatabase<T>(filePath: string, defaultValue: T): Promise<T> {
  try {
    if (!existsSync(filePath)) {
      await fs.writeFile(filePath, JSON.stringify(defaultValue, null, 2), "utf-8");
      return defaultValue;
    }
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data) as T;
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return defaultValue;
  }
}

async function writeDatabase<T>(filePath: string, data: T): Promise<void> {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

// Preset seeds mirroring mockData for out-of-the-box system initialization
const initialCurrentUser = {
  id: "6d0370",
  username: "root",
  email: "admin@skyport.alt",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces",
  role: "Administrator",
  isVerified: true,
  createdAt: "2026-01-10T14:32:00Z",
  has2FA: false
};

const initialUsersList = [initialCurrentUser];

const initialNodesList = [
  {
    id: "node_dal01",
    name: "Dallas AMD EPYC Core 01",
    ip: "127.0.0.1", // Configured as localhost
    daemonPort: 8080,
    ramMaxMB: 65536,
    ramAllocatedMB: 4096,
    diskLimitGB: 1024,
    diskAllocatedGB: 20,
    cpuCores: 16,
    tags: ["nvme", "us-central", "prod"]
  }
];

const initialInstancesList = [
  {
    id: "inst_mc_spigot_01",
    name: "Minecraft Community Server",
    ownerId: "6d0370",
    ownerName: "root",
    nodeId: "node_dal01",
    nodeName: "Dallas AMD EPYC Core 01",
    status: "stopped",
    ip: "127.0.0.1",
    port: 25565,
    memoryLimitMB: 4096,
    cpuLimitPercent: 100,
    diskLimitGB: 20,
    portsMaps: "25565:25565",
    version: "1.20.4",
    eggName: "Minecraft Spigot Base",
    cpuUsagePercent: 0,
    memoryAllocMB: 0,
    diskUsageGB: 1.2,
    playersCountCurrent: 0,
    playersCountMax: 20,
    bgImageUrl: "https://images.unsplash.com/photo-1607988795691-3d0147b43231?w=800",
    categoryName: "Minecraft Platforms"
  }
];

const initialDockerImages = [
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

const initialAPIKeys = [
  {
    id: "api_key_01",
    name: "Discord-Bot-Auto-Billing",
    key: "aeth_pk_f93j2a01sl47820ka983s...",
    permissions: ["Read Instances", "Write Instances", "Trigger Power Actions"],
    createdAt: "2026-04-12T08:30:00Z",
    lastUsed: "2026-05-25T03:14:10Z"
  }
];

const initialAuditLogs = [
  {
    id: "log_01",
    userId: "6d0370",
    username: "root",
    action: "INSTANCE_CREATED",
    ipAddress: "127.0.0.1",
    details: "Successfully initialized GameInstance: 'Minecraft Community Server' on Dallas AMD EPYC Core 01.",
    timestamp: "2026-05-24T18:32:10Z"
  }
];

const initialPlugins = [
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

const defaultSettings = {
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

// Seed directories for game instances helper
async function seedInstanceDirectories(instanceId: string) {
  const instanceDir = path.join(SERVERS_DIR, instanceId);
  if (!existsSync(instanceDir)) {
    await fs.mkdir(instanceDir, { recursive: true });
    await fs.mkdir(path.join(instanceDir, "plugins"), { recursive: true });
    await fs.mkdir(path.join(instanceDir, "logs"), { recursive: true });

    // Seed default configuration files
    await fs.writeFile(
      path.join(instanceDir, "server.properties"),
      "# Minecraft Server Properties\nmax-players=20\nview-distance=10\npvp=true\nmotd=A Skypanel Hosted Node\nenforce-whitelist=false\ngenerate-structures=true",
      "utf-8"
    );
    await fs.writeFile(
      path.join(instanceDir, "bukkit.yml"),
      "settings:\n  allow-end: true\n  warn-on-overload: true\n  query-plugins: true",
      "utf-8"
    );
    await fs.writeFile(
      path.join(instanceDir, "spigot.yml"),
      "messages:\n  whitelist: You are not whitelisted on this host!\n  restart: Daemon server is rebooting.",
      "utf-8"
    );
    await fs.writeFile(
      path.join(instanceDir, "eula.txt"),
      "eula=true\n# Agreed to EULA license offline.",
      "utf-8"
    );
    await fs.writeFile(
      path.join(instanceDir, "logs", "latest.log"),
      `[10:22:15] [System] Allocating Docker Container virtual nodes...\n[10:22:16] [Minecraft] Level Seed parsed successfully. Setup loaded on VPS node.`,
      "utf-8"
    );
  }
}

// Master initialization routine
async function initDatabase() {
  await readDatabase(FILES.users, initialUsersList);
  await readDatabase(FILES.nodes, initialNodesList);
  await readDatabase(FILES.instances, initialInstancesList);
  await readDatabase(FILES.images, initialDockerImages);
  await readDatabase(FILES.apiKeys, initialAPIKeys);
  await readDatabase(FILES.auditLogs, initialAuditLogs);
  await readDatabase(FILES.plugins, initialPlugins);
  await readDatabase(FILES.settings, defaultSettings);

  // Preseed directories for default instance
  await seedInstanceDirectories("inst_mc_spigot_01");
}

async function startServer() {
  await initDatabase();

  const app = express();
  const PORT = 3000;

  // Middleware setups
  app.use(express.json());

  // CORS headers for local VPS bindings
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // ======= SYSTEM API ENDPOINTS =======

  // Users Management APIs
  app.get("/api/users", async (req, res) => {
    const list = await readDatabase(FILES.users, initialUsersList);
    res.json(list);
  });

  app.post("/api/users", async (req, res) => {
    const list = await readDatabase(FILES.users, initialUsersList);
    const newUser = req.body;
    if (!newUser.id) {
      newUser.id = "user_" + Math.random().toString(36).substring(2, 8);
    }
    if (!newUser.createdAt) {
      newUser.createdAt = new Date().toISOString();
    }
    list.push(newUser);
    await writeDatabase(FILES.users, list);
    res.status(201).json(newUser);
  });

  app.put("/api/users/:id", async (req, res) => {
    const list = await readDatabase(FILES.users, initialUsersList);
    const id = req.params.id;
    const index = list.findIndex((u: any) => u.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "User not found" });
    }
    list[index] = { ...list[index], ...req.body };
    await writeDatabase(FILES.users, list);
    res.json(list[index]);
  });

  app.delete("/api/users/:id", async (req, res) => {
    let list = await readDatabase(FILES.users, initialUsersList);
    const id = req.params.id;
    list = list.filter((u: any) => u.id !== id);
    await writeDatabase(FILES.users, list);
    res.json({ success: true });
  });

  // Nodes Management APIs
  app.get("/api/nodes", async (req, res) => {
    const list = await readDatabase(FILES.nodes, initialNodesList);
    res.json(list);
  });

  app.post("/api/nodes", async (req, res) => {
    const list = await readDatabase(FILES.nodes, initialNodesList);
    const newNode = req.body;
    if (!newNode.id) {
      newNode.id = "node_" + Math.random().toString(36).substring(2, 8);
    }
    list.push(newNode);
    await writeDatabase(FILES.nodes, list);
    res.status(201).json(newNode);
  });

  app.delete("/api/nodes/:id", async (req, res) => {
    let list = await readDatabase(FILES.nodes, initialNodesList);
    const id = req.params.id;
    list = list.filter((n: any) => n.id !== id);
    await writeDatabase(FILES.nodes, list);
    res.json({ success: true });
  });

  // Game Instances (VPS Servers) Management APIs
  app.get("/api/instances", async (req, res) => {
    const list = await readDatabase(FILES.instances, initialInstancesList);
    res.json(list);
  });

  app.post("/api/instances", async (req, res) => {
    const list = await readDatabase(FILES.instances, initialInstancesList);
    const newInst = req.body;
    if (!newInst.id) {
      newInst.id = "inst_mc_" + Math.random().toString(36).substring(2, 8);
    }
    list.push(newInst);
    await writeDatabase(FILES.instances, list);
    
    // Core directory creation on physical VPS file structure
    await seedInstanceDirectories(newInst.id);

    res.status(201).json(newInst);
  });

  app.put("/api/instances/:id", async (req, res) => {
    const list = await readDatabase(FILES.instances, initialInstancesList);
    const id = req.params.id;
    const index = list.findIndex((i: any) => i.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Instance not found" });
    }
    list[index] = { ...list[index], ...req.body };
    await writeDatabase(FILES.instances, list);
    res.json(list[index]);
  });

  app.delete("/api/instances/:id", async (req, res) => {
    let list = await readDatabase(FILES.instances, initialInstancesList);
    const id = req.params.id;
    list = list.filter((i: any) => i.id !== id);
    await writeDatabase(FILES.instances, list);

    // Optional physical code structure deletion (We keep it safe by default, or delete cleanly)
    try {
      const serverDir = path.join(SERVERS_DIR, id);
      if (existsSync(serverDir)) {
        await fs.rm(serverDir, { recursive: true, force: true });
      }
    } catch (err) {
      console.error(`Failed to delete storage files for ${id}:`, err);
    }

    res.json({ success: true });
  });

  // Live Power state manipulation
  app.post("/api/instances/:id/status", async (req, res) => {
    const list = await readDatabase(FILES.instances, initialInstancesList);
    const id = req.params.id;
    const { status } = req.body;
    const index = list.findIndex((i: any) => i.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Instance reference invalid" });
    }
    list[index].status = status;
    await writeDatabase(FILES.instances, list);

    // Append logs directly inside instance log file to emulate stdout capture
    try {
      const logFile = path.join(SERVERS_DIR, id, "logs", "latest.log");
      if (existsSync(path.dirname(logFile))) {
        const timestamp = new Date().toLocaleTimeString();
        let logText = "";
        if (status === "starting") {
          logText = `\n[${timestamp}] [System] Graceful START state intercept -- compiling JDK layers...\n[${timestamp}] [System-Daemon] Container Allocated and Bound.`;
        } else if (status === "stopped") {
          logText = `\n[${timestamp}] [System] Graceful STOP state intercept -- unbinding active core daemon sockets...\n[${timestamp}] [System-Daemon] Container Offline.`;
        } else if (status === "running") {
          logText = `\n[${timestamp}] [Minecraft-Spigot] JVM Socket listening -- server metrics sync complete.`;
        }
        await fs.appendFile(logFile, logText, "utf-8");
      }
    } catch (err) {
      console.error("Failed to append physical status change logs:", err);
    }

    res.json(list[index]);
  });

  // Server Instance Local Real File Manager APIs (VPS Sandboxed)
  app.get("/api/instances/:id/files", async (req, res) => {
    const instanceId = req.params.id;
    const relativePath = (req.query.path as string) || "";
    
    const serverDir = path.resolve(SERVERS_DIR, instanceId);
    let targetPath = path.resolve(serverDir, relativePath);

    // Directory Traversal Prevention check
    if (!targetPath.startsWith(serverDir)) {
      return res.status(403).json({ error: "Access Denied: Path traversal prohibited" });
    }

    try {
      if (!existsSync(targetPath)) {
        await fs.mkdir(targetPath, { recursive: true });
      }

      const rawItems = await fs.readdir(targetPath, { withFileTypes: true });
      const items = [];

      for (const item of rawItems) {
        const itemFullPath = path.join(targetPath, item.name);
        const statData = await fs.stat(itemFullPath);
        
        let sizeString = "--";
        if (item.isFile()) {
          const kb = statData.size / 1024;
          sizeString = kb > 1024 
            ? `${(kb / 1024).toFixed(1)} MB` 
            : `${kb.toFixed(1)} KB`;
        }

        // Return file configurations for standard rendering in Pterodactyl HUD
        let fileContent = undefined;
        if (item.isFile() && (item.name.endsWith(".txt") || item.name.endsWith(".properties") || item.name.endsWith(".yml") || item.name.endsWith(".log") || item.name.endsWith(".json") || item.name.endsWith(".conf"))) {
          try {
            fileContent = await fs.readFile(itemFullPath, "utf-8");
          } catch(e) {
            fileContent = "[Binary Payload]";
          }
        }

        items.push({
          name: item.name,
          type: item.isDirectory() ? "directory" : "file",
          size: sizeString,
          content: fileContent
        });
      }

      res.json(items);
    } catch (err: any) {
      res.status(500).json({ error: "File traversal failure on host", details: err.message });
    }
  });

  // Get File Contents directly
  app.get("/api/instances/:id/files/content", async (req, res) => {
    const instanceId = req.params.id;
    const relativePath = (req.query.path as string) || "";

    const serverDir = path.resolve(SERVERS_DIR, instanceId);
    const targetPath = path.resolve(serverDir, relativePath);

    if (!targetPath.startsWith(serverDir) || !existsSync(targetPath)) {
      return res.status(403).json({ error: "Access Denied / File not found" });
    }

    try {
      const content = await fs.readFile(targetPath, "utf-8");
      res.json({ content });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to load target payload details", details: err.message });
    }
  });

  // Write file payload content
  app.post("/api/instances/:id/files", async (req, res) => {
    const instanceId = req.params.id;
    const { path: relativePath, content } = req.body;

    const serverDir = path.resolve(SERVERS_DIR, instanceId);
    const targetPath = path.resolve(serverDir, relativePath);

    if (!targetPath.startsWith(serverDir)) {
      return res.status(403).json({ error: "Access Denied: Path traversal prohibited" });
    }

    try {
      await fs.mkdir(path.dirname(targetPath), { recursive: true });
      await fs.writeFile(targetPath, content || "", "utf-8");
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to execute IO transaction on host", details: err.message });
    }
  });

  // Make subdirectory folder inside instance content path
  app.post("/api/instances/:id/files/mkdir", async (req, res) => {
    const instanceId = req.params.id;
    const { path: relativePath } = req.body;

    const serverDir = path.resolve(SERVERS_DIR, instanceId);
    const targetPath = path.resolve(serverDir, relativePath);

    if (!targetPath.startsWith(serverDir)) {
      return res.status(403).json({ error: "Access Denied: Path traversal prohibited" });
    }

    try {
      await fs.mkdir(targetPath, { recursive: true });
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to initialize folder structural node", details: err.message });
    }
  });

  // Delete local file/folder on VPS inside servers directory path
  app.delete("/api/instances/:id/files", async (req, res) => {
    const instanceId = req.params.id;
    const relativePath = (req.query.path as string) || "";

    const serverDir = path.resolve(SERVERS_DIR, instanceId);
    const targetPath = path.resolve(serverDir, relativePath);

    if (!targetPath.startsWith(serverDir)) {
      return res.status(403).json({ error: "Access Denied: Path traversal prohibited" });
    }

    try {
      if (existsSync(targetPath)) {
        await fs.rm(targetPath, { recursive: true, force: true });
      }
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to clean physical index", details: err.message });
    }
  });

  // Docker Eggs (Yolks) Images APIs
  app.get("/api/images", async (req, res) => {
    const list = await readDatabase(FILES.images, initialDockerImages);
    res.json(list);
  });

  app.post("/api/images", async (req, res) => {
    const list = await readDatabase(FILES.images, initialDockerImages);
    const newImg = req.body;
    if (!newImg.id) {
      newImg.id = "img_" + Math.random().toString(36).substring(2, 8);
    }
    list.push(newImg);
    await writeDatabase(FILES.images, list);
    res.status(201).json(newImg);
  });

  app.delete("/api/images/:id", async (req, res) => {
    let list = await readDatabase(FILES.images, initialDockerImages);
    const id = req.params.id;
    list = list.filter((i: any) => i.id !== id);
    await writeDatabase(FILES.images, list);
    res.json({ success: true });
  });

  // API Keys Authorization token APIs
  app.get("/api/api-keys", async (req, res) => {
    const list = await readDatabase(FILES.apiKeys, initialAPIKeys);
    res.json(list);
  });

  app.post("/api/api-keys", async (req, res) => {
    const list = await readDatabase(FILES.apiKeys, initialAPIKeys);
    const newKey = req.body;
    if (!newKey.id) {
      newKey.id = "api_key_" + Math.random().toString(36).substring(2, 8);
    }
    if (!newKey.createdAt) {
      newKey.createdAt = new Date().toISOString();
    }
    list.push(newKey);
    await writeDatabase(FILES.apiKeys, list);
    res.status(201).json(newKey);
  });

  app.delete("/api/api-keys/:id", async (req, res) => {
    let list = await readDatabase(FILES.apiKeys, initialAPIKeys);
    const id = req.params.id;
    list = list.filter((k: any) => k.id !== id);
    await writeDatabase(FILES.apiKeys, list);
    res.json({ success: true });
  });

  // Audit Logs / System Alerts APIs
  app.get("/api/audit-logs", async (req, res) => {
    const list = await readDatabase(FILES.auditLogs, initialAuditLogs);
    res.json(list);
  });

  app.post("/api/audit-logs", async (req, res) => {
    const list = await readDatabase(FILES.auditLogs, initialAuditLogs);
    const newLog = req.body;
    if (!newLog.id) {
      newLog.id = "log_" + Math.random().toString(36).substring(2, 8);
    }
    if (!newLog.timestamp) {
      newLog.timestamp = new Date().toISOString();
    }
    list.unshift(newLog); // Push newest to front
    await writeDatabase(FILES.auditLogs, list);
    res.status(201).json(newLog);
  });

  // Local Plugins Marketplace / Directory APIs
  app.get("/api/plugins", async (req, res) => {
    const list = await readDatabase(FILES.plugins, initialPlugins);
    res.json(list);
  });

  app.post("/api/plugins", async (req, res) => {
    const list = await readDatabase(FILES.plugins, initialPlugins);
    const newPl = req.body;
    if (!newPl.id) {
      newPl.id = "pl_" + Math.random().toString(36).substring(2, 8);
    }
    list.push(newPl);
    await writeDatabase(FILES.plugins, list);
    res.status(201).json(newPl);
  });

  app.delete("/api/plugins/:id", async (req, res) => {
    let list = await readDatabase(FILES.plugins, initialPlugins);
    const id = req.params.id;
    list = list.filter((p: any) => p.id !== id);
    await writeDatabase(FILES.plugins, list);
    res.json({ success: true });
  });

  // System Core Settings Panel configuration APIs
  app.get("/api/settings", async (req, res) => {
    const data = await readDatabase(FILES.settings, defaultSettings);
    res.json(data);
  });

  app.post("/api/settings", async (req, res) => {
    const current = await readDatabase(FILES.settings, defaultSettings);
    const nextSettings = { ...current, ...req.body };
    await writeDatabase(FILES.settings, nextSettings);
    res.json(nextSettings);
  });

  // Integrated CLI Console simulation daemon diagnostics metrics route
  app.get("/api/system/vitals", (req, res) => {
    const loadAvg = [0.12, 0.45, 0.82]; // Host machine CPU averages
    const totalMem = 64 * 1024; // MB
    const freeMem = Math.max(2048, Math.floor(totalMem * (0.3 + Math.random() * 0.4)));
    res.json({
      cpuLoad: parseFloat((5 + Math.random() * 20).toFixed(1)),
      loadAverage: loadAvg,
      ramTotalMB: totalMem,
      ramFreeMB: freeMem,
      diskTotalGB: 1024,
      diskFreeGB: 850,
      systemUptimeSeconds: Math.floor(process.uptime()),
      coreDaemonVersion: "v1.4.2-local-vps"
    });
  });

  // ===== VITE MIDDLEWARE CONFIGURATION FOR STANDALONE OR INTEGRATED RUNTIMES =====
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n======================================================`);
    console.log(` SKYPANEL VPS CORE DEPLOYED SUCCESSFULLY ON PORT ${PORT}`);
    console.log(` Running Offline-capable environment, databases in ./data/`);
    console.log(` URL: http://0.0.0.0:${PORT}`);
    console.log(`======================================================\n`);
  });
}

startServer();
