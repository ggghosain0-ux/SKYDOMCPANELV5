/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Users, UserPlus, ShieldPlus, Trash2, Check, X, Shield, ShieldCheck } from "lucide-react";
import { SystemUser, UserRole } from "../types";

interface AdminUsersProps {
  users: SystemUser[];
  onAddUser: (u: SystemUser) => void;
  onUpdateUserRole: (id: string, role: UserRole) => void;
  onToggleVerification: (id: string) => void;
  onDeleteUser: (id: string) => void;
}

export default function AdminUsers({
  users,
  onAddUser,
  onUpdateUserRole,
  onToggleVerification,
  onDeleteUser,
}: AdminUsersProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("Client");
  const [isVerified, setIsVerified] = useState(true);

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !email.trim()) return;

    const newUser: SystemUser = {
      id: `usr_${Math.random().toString(36).substring(2, 8)}`,
      username: username.trim(),
      email: email.trim(),
      avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 500000)}?w=100&h=100&fit=crop&crop=faces`,
      role,
      isVerified,
      createdAt: new Date().toISOString(),
    };

    onAddUser(newUser);

    // Reset Form
    setUsername("");
    setEmail("");
    setRole("Client");
    setIsVerified(true);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header action */}
      <div className="flex justify-between items-center bg-[#11121d] p-5 rounded-xl border border-white/5 shadow-xs">
        <div>
          <h2 className="text-xl font-display font-medium text-white tracking-tight">
            User Account Management Grid
          </h2>
          <p className="text-xs text-gray-400 font-sans">
            Provision, manage, restrict, or modify administrative states on user database rosters.
          </p>
        </div>
        <button
          id="btn-add-user-modal"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-550 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-[0_4px_12px_rgba(79,70,229,0.25)] transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          Create User Account
        </button>
      </div>

      {/* Roster table */}
      <div className="bg-[#11121d] rounded-xl border border-white/5 overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs select-none">
            <thead>
              <tr className="bg-[#0b0c10] border-b border-white/5 text-gray-400 font-mono">
                <th className="px-5 py-3 font-semibold uppercase tracking-wider">User Identity</th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wider">Unique ID</th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wider">Email Address</th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wider">Verified State</th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wider">Role Authority</th>
                <th className="px-5 py-3 font-semibold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/4 font-sans text-gray-300">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-white/2 transition-colors">
                  {/* Persona */}
                  <td className="px-5 py-3.5 flex items-center gap-3">
                    <img
                      src={user.avatarUrl || undefined}
                      alt={user.username}
                      className="w-8 h-8 rounded-lg object-cover bg-black/50"
                      referrerPolicy="no-referrer"
                    />
                    <span className="font-semibold text-gray-200">{user.username}</span>
                  </td>

                  {/* ID */}
                  <td className="px-5 py-3.5 font-mono text-gray-500">
                    {user.id}
                  </td>

                  {/* Email */}
                  <td className="px-5 py-3.5 font-sans">
                    {user.email}
                  </td>

                  {/* Verification Status option */}
                  <td className="px-5 py-3.5">
                    <button
                      id={`user-toggle-verify-${user.id}`}
                      onClick={() => onToggleVerification(user.id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold border cursor-pointer ${
                        user.isVerified
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      }`}
                      title="Click to toggle verify status"
                    >
                      {user.isVerified ? (
                        <>
                          <Check className="w-2.5 h-2.5" /> Verified
                        </>
                      ) : (
                        <>
                          <X className="w-2.5 h-2.5" /> Unverified
                        </>
                      )}
                    </button>
                  </td>

                  {/* Role authority toggle */}
                  <td className="px-5 py-3.5">
                    <button
                      id={`user-role-toggle-${user.id}`}
                      onClick={() =>
                        onUpdateUserRole(
                          user.id,
                          user.role === "Administrator" ? "Client" : "Administrator"
                        )
                      }
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer border ${
                        user.role === "Administrator"
                          ? "bg-indigo-650/10 text-indigo-400 border-indigo-500/25"
                          : "bg-neutral-800/10 text-gray-400 border-white/5"
                      }`}
                      title="Toggle role credentials"
                    >
                      {user.role === "Administrator" ? (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                          Administrator
                        </>
                      ) : (
                        <>
                          <Shield className="w-3.5 h-3.5 text-gray-500" />
                          Client
                        </>
                      )}
                    </button>
                  </td>

                  {/* Delete options */}
                  <td className="px-5 py-3.5 text-right">
                    <button
                      id={`user-delete-${user.id}`}
                      onClick={() => onDeleteUser(user.id)}
                      disabled={user.id === "6d0370"} // Protect main root
                      className="p-1 px-2.5 bg-rose-950/20 hover:bg-rose-900/40 text-rose-400 border border-rose-500/10 hover:border-rose-500/25 rounded-md text-[10px] font-mono transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      title={user.id === "6d0370" ? "Protected system Root account" : "Destroy user record"}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Creation Wizard Modal Dialog overlays */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#06070a]/80 backdrop-blur-xs flex items-center justify-center p-4 z-40">
          <div className="glass-pane w-full max-w-lg p-6 rounded-2xl shadow-2xl relative space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-indigo-400" />
              Provision New User Identity
            </h3>

            <form onSubmit={handleSubmitAdd} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block">
                  Username ID
                </label>
                <input
                  id="user-add-username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="steve_craft"
                  className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-xs text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block">
                  Email Address
                </label>
                <input
                  id="user-add-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="steve@aether.panel"
                  className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-xs text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block">
                    Role Authority
                  </label>
                  <select
                    id="user-add-role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full bg-[#0a0b10] border border-white/10 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-hidden focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="Client">Client</option>
                    <option value="Administrator">Administrator</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block">
                    Verify Gate Override
                  </label>
                  <select
                    id="user-add-verified"
                    value={isVerified ? "true" : "false"}
                    onChange={(e) => setIsVerified(e.target.value === "true")}
                    className="w-full bg-[#0a0b10] border border-white/10 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-hidden focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="true">Force Verified (Active)</option>
                    <option value="false">Require Verify Link</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/5">
                <button
                  id="btn-user-cancel"
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-750 text-gray-300 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="btn-user-submit"
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-550 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Confirm Provision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
