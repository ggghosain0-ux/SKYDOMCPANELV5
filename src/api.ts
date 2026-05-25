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
  PanelSettings,
  InstanceStatus
} from "./types";

const API_BASE = "/api";

async function fetchResponse<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {})
    }
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error: ${response.status} - ${errorText || response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export const api = {
  // === USER MANAGEMENT ===
  getUsers: () => fetchResponse<SystemUser[]>(`${API_BASE}/users`),
  createUser: (user: SystemUser) => fetchResponse<SystemUser>(`${API_BASE}/users`, {
    method: "POST",
    body: JSON.stringify(user)
  }),
  updateUser: (id: string, user: Partial<SystemUser>) => fetchResponse<SystemUser>(`${API_BASE}/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(user)
  }),
  deleteUser: (id: string) => fetchResponse<{ success: boolean }>(`${API_BASE}/users/${id}`, {
    method: "DELETE"
  }),

  // === NODE MANAGEMENT ===
  getNodes: () => fetchResponse<PhysicalNode[]>(`${API_BASE}/nodes`),
  createNode: (node: PhysicalNode) => fetchResponse<PhysicalNode>(`${API_BASE}/nodes`, {
    method: "POST",
    body: JSON.stringify(node)
  }),
  deleteNode: (id: string) => fetchResponse<{ success: boolean }>(`${API_BASE}/nodes/${id}`, {
    method: "DELETE"
  }),

  // === SERVER/INSTANCE MANAGEMENT ===
  getInstances: () => fetchResponse<GameInstance[]>(`${API_BASE}/instances`),
  createInstance: (inst: GameInstance) => fetchResponse<GameInstance>(`${API_BASE}/instances`, {
    method: "POST",
    body: JSON.stringify(inst)
  }),
  updateInstance: (id: string, inst: Partial<GameInstance>) => fetchResponse<GameInstance>(`${API_BASE}/instances/${id}`, {
    method: "PUT",
    body: JSON.stringify(inst)
  }),
  deleteInstance: (id: string) => fetchResponse<{ success: boolean }>(`${API_BASE}/instances/${id}`, {
    method: "DELETE"
  }),
  setInstanceStatus: (id: string, status: InstanceStatus) => fetchResponse<GameInstance>(`${API_BASE}/instances/${id}/status`, {
    method: "POST",
    body: JSON.stringify({ status })
  }),

  // === FILE SYSTEM FOR INSTANCES (SANDBOXED VPS PATHS) ===
  getInstanceFiles: (id: string, path = "") => fetchResponse<{ name: string; type: "file" | "directory"; size: string; content?: string }[]>(
    `${API_BASE}/instances/${id}/files?path=${encodeURIComponent(path)}`
  ),
  getFileContent: (id: string, path: string) => fetchResponse<{ content: string }>(
    `${API_BASE}/instances/${id}/files/content?path=${encodeURIComponent(path)}`
  ),
  writeInstanceFile: (id: string, path: string, content: string) => fetchResponse<{ success: boolean }>(
    `${API_BASE}/instances/${id}/files`, {
      method: "POST",
      body: JSON.stringify({ path, content })
    }
  ),
  createInstanceDir: (id: string, path: string) => fetchResponse<{ success: boolean }>(
    `${API_BASE}/instances/${id}/files/mkdir`, {
      method: "POST",
      body: JSON.stringify({ path })
    }
  ),
  deleteInstanceFile: (id: string, path: string) => fetchResponse<{ success: boolean }>(
    `${API_BASE}/instances/${id}/files?path=${encodeURIComponent(path)}`, {
      method: "DELETE"
    }
  ),

  // === IMAGES (DOCKER EGGS) MANAGEMENT ===
  getImages: () => fetchResponse<DockerImage[]>(`${API_BASE}/images`),
  createImage: (img: DockerImage) => fetchResponse<DockerImage>(`${API_BASE}/images`, {
    method: "POST",
    body: JSON.stringify(img)
  }),
  deleteImage: (id: string) => fetchResponse<{ success: boolean }>(`${API_BASE}/images/${id}`, {
    method: "DELETE"
  }),

  // === API KEYS ===
  getAPIKeys: () => fetchResponse<APIKey[]>(`${API_BASE}/api-keys`),
  createAPIKey: (key: APIKey) => fetchResponse<APIKey>(`${API_BASE}/api-keys`, {
    method: "POST",
    body: JSON.stringify(key)
  }),
  deleteAPIKey: (id: string) => fetchResponse<{ success: boolean }>(`${API_BASE}/api-keys/${id}`, {
    method: "DELETE"
  }),

  // === AUDIT LOGS ===
  getAuditLogs: () => fetchResponse<AuditLog[]>(`${API_BASE}/audit-logs`),
  createAuditLog: (log: Omit<AuditLog, "id">) => fetchResponse<AuditLog>(`${API_BASE}/audit-logs`, {
    method: "POST",
    body: JSON.stringify(log)
  }),

  // === PLUGINS ===
  getPlugins: () => fetchResponse<PluginExtension[]>(`${API_BASE}/plugins`),
  createPlugin: (pl: PluginExtension) => fetchResponse<PluginExtension>(`${API_BASE}/plugins`, {
    method: "POST",
    body: JSON.stringify(pl)
  }),
  deletePlugin: (id: string) => fetchResponse<{ success: boolean }>(`${API_BASE}/plugins/${id}`, {
    method: "DELETE"
  }),

  // === GENERAL PANEL SETTINGS ===
  getSettings: () => fetchResponse<PanelSettings>(`${API_BASE}/settings`),
  saveSettings: (settings: PanelSettings) => fetchResponse<PanelSettings>(`${API_BASE}/settings`, {
    method: "POST",
    body: JSON.stringify(settings)
  }),

  // === DAEMON DIAGNOSTICS ===
  getSystemVitals: () => fetchResponse<{
    cpuLoad: number;
    loadAverage: number[];
    ramTotalMB: number;
    ramFreeMB: number;
    diskTotalGB: number;
    diskFreeGB: number;
    systemUptimeSeconds: number;
    coreDaemonVersion: string;
  }>(`${API_BASE}/system/vitals`)
};
