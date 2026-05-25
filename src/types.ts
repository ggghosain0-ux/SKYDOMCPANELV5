/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = "Administrator" | "Client";
export type InstanceStatus = "running" | "stopped" | "starting" | "stopping";

export interface SystemUser {
  id: string;
  username: string;
  email: string;
  avatarUrl: string;
  role: UserRole;
  isVerified: boolean;
  createdAt: string;
  has2FA?: boolean;
}

export interface GameInstance {
  id: string;
  name: string;
  ownerId: string;
  ownerName: string;
  nodeId: string;
  nodeName: string;
  status: InstanceStatus;
  ip: string;
  port: number;
  memoryLimitMB: number;
  cpuLimitPercent: number;
  diskLimitGB: number;
  portsMaps: string; // e.g. "25565:25565, 8123:8123"
  version: string;
  eggName: string;
  
  // Custom display enhancements for photo-accurate layouts
  cpuUsagePercent?: number;
  memoryAllocMB?: number;
  diskUsageGB?: number;
  playersCountCurrent?: number;
  playersCountMax?: number;
  bgImageUrl?: string;
  categoryName?: string;
}

export interface PhysicalNode {
  id: string;
  name: string;
  ip: string;
  daemonPort: number;
  ramMaxMB: number;
  ramAllocatedMB: number;
  diskLimitGB: number;
  diskAllocatedGB: number;
  cpuCores: number;
  tags: string[];
}

export interface DockerImage {
  id: string;
  name: string;
  tag: string;
  category: string;
  repo: string;
  description: string;
}

export interface APIKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  createdAt: string;
  lastUsed: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  username: string;
  action: string;
  ipAddress: string;
  details: string;
  timestamp: string;
}

export interface PluginExtension {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  isEnabled: boolean;
  fileName?: string;
  imageUrl?: string;
  downloadUrl?: string;
  sourceType?: "upload" | "download_link";
}

export interface PanelSettings {
  panelName: string;
  logoUrl: string;
  allowRegistration: boolean;
  forceEmailVerification: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpSecure: boolean;
  activeTheme: "dark" | "midnight" | "cosmic";
}
