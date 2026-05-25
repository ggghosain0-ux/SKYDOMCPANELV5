/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { api } from "./api";
import {
  initialCurrentUser,
  initialUsersList,
  initialNodesList,
  initialInstancesList,
  initialDockerImages,
  initialAPIKeys,
  initialAuditLogs,
  initialPlugins,
  defaultSettings
} from "./mockData";
import {
  SystemUser,
  GameInstance,
  PhysicalNode,
  DockerImage,
  APIKey,
  AuditLog,
  PluginExtension,
  PanelSettings,
  InstanceStatus,
  UserRole
} from "./types";

// Component imports
import LoginGateway from "./components/LoginGateway";
import SidebarShell, { NavItemKey } from "./components/SidebarShell";
import InstanceConsole from "./components/InstanceConsole";
import ClientServersList from "./components/ClientServersList";
import AccountGateway from "./components/AccountGateway";
import AdminOverview from "./components/AdminOverview";
import AdminSettings from "./components/AdminSettings";
import AdminAnalytics from "./components/AdminAnalytics";
import AdminUsers from "./components/AdminUsers";
import AdminInstances from "./components/AdminInstances";
import AdminNodes from "./components/AdminNodes";
import AdminImages from "./components/AdminImages";
import AdminAPIKeys from "./components/AdminAPIKeys";
import AdminAuditLogs from "./components/AdminAuditLogs";
import AdminPlugins from "./components/AdminPlugins";

import { Server, Terminal, Shield, RefreshCw, Menu } from "lucide-react";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  // Core database tables states
  const [currentUser, setCurrentUser] = useState<SystemUser>(initialCurrentUser);
  const [usersList, setUsersList] = useState<SystemUser[]>(initialUsersList);
  const [nodesList, setNodesList] = useState<PhysicalNode[]>(initialNodesList);
  const [instancesList, setInstancesList] = useState<GameInstance[]>([]);
  const [dockerImages, setDockerImages] = useState<DockerImage[]>(initialDockerImages);
  const [apiKeys, setApiKeys] = useState<APIKey[]>(initialAPIKeys);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);
  const [plugins, setPlugins] = useState<PluginExtension[]>(initialPlugins);
  const [settings, setSettings] = useState<PanelSettings>(defaultSettings);

  // Active navigational view state
  const [activeView, setActiveView] = useState<string>("client_instances");
  const [selectedInstance, setSelectedInstance] = useState<GameInstance | null>(null);

  // Load state from client storage on mount and fetch database records
  useEffect(() => {
    const savedUser = localStorage.getItem("aether_logged_user");
    if (savedUser) {
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      const loadAllDataFromVPS = async () => {
        try {
          const [
            users,
            nodes,
            instances,
            images,
            keys,
            logs,
            plugs,
            conf
          ] = await Promise.all([
            api.getUsers(),
            api.getNodes(),
            api.getInstances(),
            api.getImages(),
            api.getAPIKeys(),
            api.getAuditLogs(),
            api.getPlugins(),
            api.getSettings()
          ]);
          setUsersList(users);
          setNodesList(nodes);
          setInstancesList(instances);
          setDockerImages(images);
          setApiKeys(keys);
          setAuditLogs(logs);
          setPlugins(plugs);
          setSettings(conf);

          // Default selected instance
          if (instances.length > 0) {
            setSelectedInstance(instances[0]);
          }

          const loggedUsername = localStorage.getItem("aether_logged_user") || "root";
          const matchUser = users.find((u) => u.username === loggedUsername);
          if (matchUser) {
            setCurrentUser(matchUser);
          }
        } catch (err) {
          console.error("Failed to fetch records from offline database:", err);
        }
      };
      loadAllDataFromVPS();
    }
  }, [isLoggedIn]);

  const handleLoginSuccess = async (usr: string) => {
    setIsLoggedIn(true);
    localStorage.setItem("aether_logged_user", usr);

    const loggedUserRecord = usersList.find((u) => u.username === usr) || {
      ...initialCurrentUser,
      username: usr,
    };
    setCurrentUser(loggedUserRecord);

    // Default view: Game Servers List Dashboard
    setActiveView("client_instances");
    if (instancesList.length > 0) {
      setSelectedInstance(instancesList[0]);
    }

    try {
      const audit = await api.createAuditLog({
        userId: loggedUserRecord.id,
        username: loggedUserRecord.username,
        action: "SECURITY_CREDENTIALS_CHANGED",
        ipAddress: "127.0.0.1",
        details: `User metadata session initialized on Aether Systems Kernel.`,
        timestamp: new Date().toISOString(),
      });
      setAuditLogs((prev) => [audit, ...prev]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSignOut = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("aether_logged_user");
  };

  // Callback mutator handlers to support database transactions in local storage
  const handleUpdateCurrentUser = async (updated: Partial<SystemUser>) => {
    try {
      const res = await api.updateUser(currentUser.id, updated);
      setCurrentUser(res);
      setUsersList((prev) => prev.map((u) => (u.id === currentUser.id ? res : u)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddUser = async (user: SystemUser) => {
    try {
      const res = await api.createUser(user);
      setUsersList((prev) => [...prev, res]);

      const audit = await api.createAuditLog({
        userId: currentUser.id,
        username: currentUser.username,
        action: "SECURITY_CREDENTIALS_CHANGED",
        ipAddress: "127.0.0.1",
        details: `Registered new console user account identity for ${user.username} with ID ${user.id}`,
        timestamp: new Date().toISOString(),
      });
      setAuditLogs((prev) => [audit, ...prev]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateUserRole = async (id: string, role: UserRole) => {
    try {
      const res = await api.updateUser(id, { role });
      setUsersList((prev) => prev.map((u) => (u.id === id ? res : u)));
      if (id === currentUser.id) {
        setCurrentUser(res);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleUserVerification = async (id: string) => {
    const user = usersList.find((u) => u.id === id);
    if (!user) return;
    try {
      const res = await api.updateUser(id, { isVerified: !user.isVerified });
      setUsersList((prev) => prev.map((u) => (u.id === id ? res : u)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await api.deleteUser(id);
      setUsersList((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddInstance = async (inst: GameInstance) => {
    try {
      const res = await api.createInstance(inst);
      setInstancesList((prev) => [...prev, res]);

      const audit = await api.createAuditLog({
        userId: currentUser.id,
        username: currentUser.username,
        action: "INSTANCE_CREATED",
        ipAddress: "127.0.0.1",
        details: `Deployed system egg template '${inst.eggName}' to produce Instance container: '${inst.name}'.`,
        timestamp: new Date().toISOString(),
      });
      setAuditLogs((prev) => [audit, ...prev]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteInstance = async (id: string) => {
    try {
      await api.deleteInstance(id);
      setInstancesList((prev) => prev.filter((i) => i.id !== id));
      if (selectedInstance?.id === id) {
        setSelectedInstance(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleInstanceStatusChange = async (instanceId: string, status: InstanceStatus) => {
    try {
      const res = await api.setInstanceStatus(instanceId, status);
      setInstancesList((prev) => prev.map((i) => (i.id === instanceId ? res : i)));
      if (selectedInstance?.id === instanceId) {
        setSelectedInstance(res);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateInstance = async (updatedInst: GameInstance) => {
    try {
      const res = await api.updateInstance(updatedInst.id, updatedInst);
      setInstancesList((prev) => prev.map((i) => (i.id === updatedInst.id ? res : i)));
      setSelectedInstance(res);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddNode = async (node: PhysicalNode) => {
    try {
      const res = await api.createNode(node);
      setNodesList((prev) => [...prev, res]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNode = async (id: string) => {
    try {
      await api.deleteNode(id);
      setNodesList((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddImage = async (img: DockerImage) => {
    try {
      const res = await api.createImage(img);
      setDockerImages((prev) => [...prev, res]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteImage = async (id: string) => {
    try {
      await api.deleteImage(id);
      setDockerImages((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddAPIKey = async (key: APIKey) => {
    try {
      const res = await api.createAPIKey(key);
      setApiKeys((prev) => [...prev, res]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAPIKey = async (id: string) => {
    try {
      await api.deleteAPIKey(id);
      setApiKeys((prev) => prev.filter((k) => k.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePlugin = async (id: string) => {
    const target = plugins.find((p) => p.id === id);
    if (!target) return;
    try {
      const res = await api.createPlugin({ ...target, isEnabled: !target.isEnabled });
      setPlugins((prev) => prev.map((p) => (p.id === id ? res : p)));

      const audit = await api.createAuditLog({
        userId: currentUser.id,
        username: currentUser.username,
        action: "PLUGIN_TOGGLED",
        ipAddress: "127.0.0.1",
        details: `${res.isEnabled ? "Enabled" : "Disabled"} Aether plugin extension: '${res.name}'.`,
        timestamp: new Date().toISOString(),
      });
      setAuditLogs((prev) => [audit, ...prev]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddPlugin = async (pl: PluginExtension) => {
    try {
      const res = await api.createPlugin(pl);
      setPlugins((prev) => [...prev, res]);

      const audit = await api.createAuditLog({
        userId: currentUser.id,
        username: currentUser.username,
        action: "PLUGIN_CREATED",
        ipAddress: "127.0.0.1",
        details: `Registered system-wide plugin: '${pl.name}' - ${pl.version}`,
        timestamp: new Date().toISOString(),
      });
      setAuditLogs((prev) => [audit, ...prev]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePlugin = async (id: string) => {
    try {
      await api.deletePlugin(id);
      setPlugins((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSettings = async (nextSettings: PanelSettings) => {
    try {
      const res = await api.saveSettings(nextSettings);
      setSettings(res);
    } catch (err) {
      console.error(err);
    }
  };

  // Navigation controller interceptor
  const handleNavigate = (view: NavItemKey | string) => {
    setActiveView(view);
    if (view === "client_instances" && instancesList.length > 0) {
      // Keep first index selected as safe default references
    }
  };

  const handleSelectInstanceConsoleLaunch = (inst: GameInstance) => {
    setSelectedInstance(inst);
    setActiveView("instance_console");
  };

  // Determine active render module
  const renderCoreViewContent = () => {
    switch (activeView) {
      case "client_instances":
        return (
          <ClientServersList
            instances={instancesList}
            onSelect={handleSelectInstanceConsoleLaunch}
            onStatusChange={handleInstanceStatusChange}
          />
        );
      case "client_account":
        return <AccountGateway currentUser={currentUser} onUpdateUser={handleUpdateCurrentUser} />;
      case "admin_overview":
        return (
          <AdminOverview
            users={usersList}
            instances={instancesList}
            nodes={nodesList}
            images={dockerImages}
            onNavigate={handleNavigate}
          />
        );
      case "admin_settings":
        return <AdminSettings settings={settings} onSaveSettings={handleSaveSettings} />;
      case "admin_analytics":
        return <AdminAnalytics />;
      case "admin_users":
        return (
          <AdminUsers
            users={usersList}
            onAddUser={handleAddUser}
            onUpdateUserRole={handleUpdateUserRole}
            onToggleVerification={handleToggleUserVerification}
            onDeleteUser={handleDeleteUser}
          />
        );
      case "admin_instances":
        return (
          <AdminInstances
            instances={instancesList}
            users={usersList}
            nodes={nodesList}
            onAddInstance={handleAddInstance}
            onDeleteInstance={handleDeleteInstance}
            onSelectInstance={handleSelectInstanceConsoleLaunch}
          />
        );
      case "admin_nodes":
        return <AdminNodes nodes={nodesList} onAddNode={handleAddNode} onDeleteNode={handleDeleteNode} />;
      case "admin_images":
        return <AdminImages images={dockerImages} onAddImage={handleAddImage} onDeleteImage={handleDeleteImage} />;
      case "admin_api_keys":
        return <AdminAPIKeys apiKeys={apiKeys} onAddKey={handleAddAPIKey} onDeleteKey={handleDeleteAPIKey} />;
      case "admin_audit_logs":
        return <AdminAuditLogs logs={auditLogs} />;
      case "admin_plugins":
        return (
          <AdminPlugins
            plugins={plugins}
            onTogglePlugin={handleTogglePlugin}
            onAddPlugin={handleAddPlugin}
            onDeletePlugin={handleDeletePlugin}
          />
        );
      case "instance_console":
        return selectedInstance ? (
          <InstanceConsole
            instance={selectedInstance}
            onStatusChange={handleInstanceStatusChange}
            onBack={() => setActiveView("client_instances")}
            plugins={plugins}
            onUpdateInstance={handleUpdateInstance}
          />
        ) : (
          <div className="p-8 text-center text-gray-500 italic bg-[#11121d] border border-white/5 rounded-xl">
            Please choose a valid virtual server container to initialize the Metrics Console HUD.
          </div>
        );
      default:
        return <div className="p-4 text-white text-sm">Target Route Reference Invalid.</div>;
    }
  };

  // Render Login gateway or admin dashboard
  if (!isLoggedIn) {
    return <LoginGateway onSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#0d0e12] flex overflow-hidden font-sans text-gray-300 antialiased select-none">
      {/* 2. Persistent Sidebar Shell */}
      <SidebarShell
        currentUser={currentUser}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        activeView={activeView}
        onNavigate={handleNavigate}
        onSignOut={handleSignOut}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        settings={settings}
      />

      {/* Main Core Content Container right of side navigation */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Global Toolbar Header */}
        <header className="bg-[#15171e] border-b border-[#1e212b] h-14 shrink-0 flex items-center justify-between px-6 select-none z-10">
          <div className="flex items-center gap-3">
            {/* Hamburger trigger for mobile viewport drawer */}
            <button
              id="mobile-menu-trigger"
              onClick={() => setMobileOpen(true)}
              className="p-1.5 rounded-lg hover:bg-[#1e212b] text-[#9ca3af] hover:text-white md:hidden cursor-pointer"
              title="Toggle Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="font-display font-bold text-xs tracking-wide text-white uppercase flex items-center gap-2 select-none">
              <span className="text-[#10b981] font-extrabold text-[#10b981] bg-[#10b981]/10 border border-[#10b981]/20 px-1.5 py-0.5 rounded text-sm">S</span>
              {settings.panelName}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Standard quick node status badges */}
            <div className="hidden sm:flex items-center gap-2 bg-[#1e212b]/40 border border-[#1e212b] p-1 px-3 rounded-xl text-[10px] font-mono">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
              <span className="text-[#9ca3af]">Core Daemon Engine: <strong className="text-[#10b981]">ONLINE</strong></span>
            </div>

            {/* Quick instance back to console selector */}
            {instancesList.length > 0 && (
              <select
                id="header-instance-quickset"
                value={selectedInstance?.id || ""}
                onChange={(e) => {
                  const target = instancesList.find((i) => i.id === e.target.value);
                  if (target) {
                    setSelectedInstance(target);
                    setActiveView("instance_console");
                  }
                }}
                className="bg-[#1e212b] hover:bg-[#1e212b]/80 text-[#9ca3af] hover:text-white rounded-lg text-[10px] font-mono py-1.5 px-3 border border-white/5 cursor-pointer"
                title="Quickly switch instance consoles"
              >
                {instancesList.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name.length > 18 ? `${i.name.substring(0, 18)}...` : i.name} ({i.status})
                  </option>
                ))}
              </select>
            )}
          </div>
        </header>

        {/* 3. The Context-Aware Core Content Panel wrapper overflow auto scrolling */}
        <section className="flex-1 overflow-y-auto p-6 bg-[#0d0e12] selection:bg-[#10b981] selection:text-white relative">
          {/* Subtle cosmic background gradient lights */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-950/2 rounded-full blur-[100px] pointer-events-none" />

          {/* Core active views renderer container */}
          <div className="max-w-7xl mx-auto space-y-6">
            {renderCoreViewContent()}
          </div>
        </section>
      </main>
    </div>
  );
}
