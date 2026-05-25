/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Layers, Plus, Trash2, Tag, BookOpen, AlertCircle } from "lucide-react";
import { DockerImage } from "../types";

interface AdminImagesProps {
  images: DockerImage[];
  onAddImage: (img: DockerImage) => void;
  onDeleteImage: (id: string) => void;
}

export default function AdminImages({ images, onAddImage, onDeleteImage }: AdminImagesProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [tagStr, setTagStr] = useState("latest");
  const [category, setCategory] = useState("Minecraft Platforms");
  const [repo, setRepo] = useState("ghcr.io/pterodactyl/yolks:java_17");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !repo.trim()) return;

    const newImg: DockerImage = {
      id: `img_${Math.random().toString(36).substring(2, 8)}`,
      name: name.trim(),
      tag: tagStr.trim(),
      category,
      repo: repo.trim(),
      description: description.trim() || "No customized setup notes provided for this server pack image.",
    };

    onAddImage(newImg);

    // Reset Form
    setName("");
    setTagStr("latest");
    setDescription("");
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex justify-between items-center bg-[#11121d] p-5 rounded-xl border border-white/5 shadow-xs">
        <div>
          <h2 className="text-xl font-display font-medium text-white tracking-tight">
            Docker Engine Base Environments & Game Configurations
          </h2>
          <p className="text-xs text-gray-400 font-sans">
            Specify containerized software setups, game servers metadata catalogs, and execution layers mappings.
          </p>
        </div>
        <button
          id="btn-add-image-modal"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-550 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-[0_4px_12px_rgba(79,70,229,0.25)] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Import Docker Egg Setup
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {images.map((img) => (
          <div key={img.id} className="bg-[#11121d] p-5 rounded-xl border border-white/5 flex flex-col justify-between shadow-xs">
            <div className="space-y-3.5">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono tracking-wider font-bold text-indigo-400 uppercase bg-indigo-500/10 border border-indigo-505/10 px-2.5 py-0.5 rounded-full inline-block">
                    {img.category}
                  </span>
                  <h3 className="text-sm font-semibold text-gray-100 mt-1">{img.name}</h3>
                </div>

                <div className="flex items-center gap-1 font-mono text-[10px] text-gray-400">
                  <Tag className="w-3.5 h-3.5 text-gray-500" /> {img.tag}
                </div>
              </div>

              <p className="text-xs text-gray-450 leading-relaxed font-sans mt-1">
                {img.description}
              </p>

              <div className="bg-black/25 p-3 rounded-lg border border-white/4 font-mono text-xs text-teal-400 flex items-center gap-1.5 break-all select-all">
                <BookOpen className="w-4 h-4 text-teal-500 shrink-0" /> {img.repo}
              </div>
            </div>

            <div className="pt-4 border-t border-white/4 mt-4 flex justify-between items-center text-xs">
              <span className="font-mono text-[10px] text-gray-500 uppercase">{img.id}</span>

              <button
                id={`btn-image-delete-${img.id}`}
                onClick={() => onDeleteImage(img.id)}
                disabled={images.length <= 1} // Protect catalog minimums
                className="p-1 px-2.5 bg-rose-950/20 hover:bg-rose-900/40 text-rose-500 border border-rose-500/10 hover:border-rose-500/25 rounded-md text-[10px] font-mono transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                title="Destroy game server setup record"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500 inline mr-1" /> Destroy Pack
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Creation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#06070a]/80 backdrop-blur-xs flex items-center justify-center p-4 z-40">
          <div className="glass-pane w-full max-w-lg p-6 rounded-2xl shadow-2xl relative space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-400" />
              Import Docker Image Pack Setup
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block">
                  Software Pack Name
                </label>
                <input
                  id="image-add-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Minecraft Purpur Experimental"
                  className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-xs text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block">
                    Software Category Group
                  </label>
                  <select
                    id="image-add-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#0a0b10] border border-white/10 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-hidden cursor-pointer"
                  >
                    <option value="Minecraft Platforms">Minecraft Platforms</option>
                    <option value="Linux App Engines">Linux App Engines</option>
                    <option value="Web Servers">Web Servers</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block">
                    Base Docker Tag tag
                  </label>
                  <input
                    id="image-add-tag"
                    type="text"
                    required
                    value={tagStr}
                    onChange={(e) => setTagStr(e.target.value)}
                    placeholder="latest"
                    className="w-full bg-black/40 border border-white/10 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block">
                  Docker Registry Repository Repo
                </label>
                <input
                  id="image-add-repo"
                  type="text"
                  required
                  value={repo}
                  onChange={(e) => setRepo(e.target.value)}
                  placeholder="ghcr.io/pterodactyl/yolks:java_17"
                  className="w-full bg-black/40 border border-white/10 rounded-lg py-1.5 px-3 text-xs text-teal-300 font-mono focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest block">
                  Interactive Description notes
                </label>
                <textarea
                  id="image-add-desc"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide setup notes and performance configuration matrices..."
                  className="w-full bg-black/40 border border-white/10 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/5">
                <button
                  id="btn-image-cancel"
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-750 text-gray-300 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="btn-image-submit"
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-550 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Confirm Setup Pack
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
