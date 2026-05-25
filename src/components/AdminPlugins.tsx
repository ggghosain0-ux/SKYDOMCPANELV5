/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { 
  Blocks, 
  ToggleLeft, 
  ToggleRight, 
  Plus, 
  Trash2, 
  UploadCloud, 
  Image as ImageIcon, 
  Check, 
  AlertCircle,
  Link as LinkIcon
} from "lucide-react";
import { PluginExtension } from "../types";

interface AdminPluginsProps {
  plugins: PluginExtension[];
  onTogglePlugin: (id: string) => void;
  onAddPlugin: (pl: PluginExtension) => void;
  onDeletePlugin: (id: string) => void;
}

const PRESET_IMAGES = [
  { name: "Permissions Shield", url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=120&h=120&fit=crop" },
  { name: "World Redstone Block", url: "https://images.unsplash.com/photo-1607988795691-3d0147b43231?w=120&h=120&fit=crop" },
  { name: "Tech CPU Circuits", url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=120&h=120&fit=crop" },
  { name: "Cartography Compass", url: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=120&h=120&fit=crop" },
  { name: "Security Gate", url: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=120&h=120&fit=crop" }
];

export default function AdminPlugins({ 
  plugins, 
  onTogglePlugin, 
  onAddPlugin, 
  onDeletePlugin 
}: AdminPluginsProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [name, setName] = useState("");
  const [version, setVersion] = useState("v1.0.0");
  const [author, setAuthor] = useState("");
  const [fileName, setFileName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  
  // New source properties
  const [sourceType, setSourceType] = useState<"upload" | "download_link">("upload");
  const [downloadUrl, setDownloadUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simulated file upload status
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSelectPresetImage = (url: string) => {
    setImageUrl(url);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setUploadedFile(file);
      setFileName(file.name);
      setSuccessMessage(`Attached dropped file binary: ${file.name}`);
      setTimeout(() => setSuccessMessage(""), 4000);
    }
  };

  const handleRealFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setFileName(file.name);
      setSuccessMessage(`Attached file binary: ${file.name}`);
      setTimeout(() => setSuccessMessage(""), 4000);
    }
  };

  const handleSimulateDragDrop = () => {
    if (!name) {
      setErrorMessage("Please enter a Plugin Name first to auto-generate a file layout.");
      return;
    }
    setErrorMessage("");
    setIsUploading(true);
    setTimeout(() => {
      const generatedFile = `${name.toLowerCase().replace(/\s+/g, "-")}-${version}.jar`;
      setFileName(generatedFile);
      setIsUploading(false);
      setSuccessMessage(`Attached simulated asset: ${generatedFile}`);
      setTimeout(() => setSuccessMessage(""), 3000);
    }, 1200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !author) {
      setErrorMessage("Please complete all required fields (Name and Author).");
      return;
    }

    if (sourceType === "upload" && !fileName) {
      setErrorMessage("Please select or write a target Plugin File Name.");
      return;
    }

    if (sourceType === "download_link" && !downloadUrl) {
      setErrorMessage("Please provide a direct Download Link URL.");
      return;
    }

    const defaultImg = "https://images.unsplash.com/photo-1607988795691-3d0147b43231?w=120&h=120&fit=crop";
    
    const newPlugin: PluginExtension = {
      id: `pl_${Math.random().toString(36).substring(2, 8)}`,
      name,
      version,
      author,
      description: description || "Custom developer extensions loaded manually via administrative portals.",
      isEnabled: true,
      fileName: fileName || (downloadUrl ? downloadUrl.split("/").pop() : "plugin.jar") || "plugin.jar",
      imageUrl: imageUrl || defaultImg,
      sourceType,
      downloadUrl: sourceType === "download_link" ? downloadUrl : undefined
    };

    onAddPlugin(newPlugin);
    
    // Reset states
    setName("");
    setVersion("v1.0.0");
    setAuthor("");
    setFileName("");
    setDescription("");
    setImageUrl("");
    setDownloadUrl("");
    setUploadedFile(null);
    setSourceType("upload");
    setShowCreateForm(false);
    setErrorMessage("");
  };

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex justify-between items-center bg-[#11121d] p-5 rounded-xl border border-white/5 shadow-xs">
        <div>
          <h2 className="text-xl font-display font-medium text-white tracking-tight flex items-center gap-2">
            <Blocks className="w-5 h-5 text-indigo-400" />
            Core Extension Framework & Addons
          </h2>
          <p className="text-xs text-gray-400 font-sans">
            Enable, disable, upload, or register custom plugins which will live inside the servers console installer directory database.
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-indigo-650 hover:bg-indigo-550 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md select-none cursor-pointer"
        >
          <Plus className={`w-4 h-4 transition-transform ${showCreateForm ? "rotate-45" : ""}`} />
          {showCreateForm ? "Collapse Workspace" : "Register & Upload Plugin"}
        </button>
      </div>

      {/* Expandable Register/Create plugin form */}
      {showCreateForm && (
        <form onSubmit={handleSubmit} className="bg-[#11121d] p-6 rounded-xl border border-indigo-500/20 shadow-lg space-y-5 animate-fadeIn">
          <div className="border-b border-white/5 pb-2">
            <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
              <UploadCloud className="w-4 h-4 text-indigo-400" />
              Register Software Package Addon
            </h3>
            <p className="text-[11px] text-gray-400 mt-1">Provide custom files, direct download links, covers, and author mappings for backend installer nodes.</p>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-500/15 border border-red-500/20 text-red-400 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              {successMessage}
            </div>
          )}

          {/* Segmented Controller for Source Type */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
              Plugin Binary Acquisition Source <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2 bg-[#0d0e12] p-1.5 rounded-lg border border-white/5">
              <button
                type="button"
                onClick={() => {
                  setSourceType("upload");
                  setErrorMessage("");
                }}
                className={`py-2 text-xs font-sans font-semibold rounded-md flex items-center justify-center gap-1.5 transition-all select-none cursor-pointer ${
                  sourceType === "upload"
                    ? "bg-indigo-650 text-white shadow-xs"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5" />
                Local File Upload Binary
              </button>
              <button
                type="button"
                onClick={() => {
                  setSourceType("download_link");
                  setErrorMessage("");
                }}
                className={`py-2 text-xs font-sans font-semibold rounded-md flex items-center justify-center gap-1.5 transition-all select-none cursor-pointer ${
                  sourceType === "download_link"
                    ? "bg-indigo-650 text-white shadow-xs"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                Remote Download Link/URL
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left Fields */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                  Plugin Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. LuckPerms"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0d0e12] border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-hidden focus:border-indigo-500 font-sans"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                    Version <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. v5.4.1"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    className="w-full bg-[#0d0e12] border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-hidden focus:border-indigo-500 font-mono text-xs"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                    Author <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Luck"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full bg-[#0d0e12] border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-hidden focus:border-indigo-500 font-sans"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                  Local Target File Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. luckperms-bukkit.jar"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="w-full bg-[#0d0e12] border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-hidden focus:border-indigo-500 font-mono text-xs"
                  required
                />
              </div>
            </div>

            {/* Right Fields - Custom Image URL & Presets */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                  Custom Cover Logo Image (URL)
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Provide image URL..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="flex-1 bg-[#0d0e12] border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-hidden focus:border-indigo-500 font-mono text-xs"
                  />
                  {imageUrl && (
                    <img
                      src={imageUrl || undefined}
                      alt="Custom Preview"
                      className="w-9 h-9 rounded-lg object-cover bg-black border border-white/10"
                      referrerPolicy="no-referrer"
                    />
                  )}
                </div>
              </div>

              {/* Clickable presets representing distinct image blocks */}
              <div className="space-y-1 bg-black/20 p-2.5 rounded-lg border border-white/5">
                <span className="text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest block leading-none mb-1.5">
                  Pick pre-designed category icons
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_IMAGES.map((pr) => (
                    <button
                      key={pr.name}
                      type="button"
                      onClick={() => handleSelectPresetImage(pr.url)}
                      className={`text-[9px] px-2 py-1 rounded-sm border select-none transition-all cursor-pointer ${
                        imageUrl === pr.url
                          ? "bg-indigo-650/30 border-indigo-400 text-indigo-300 font-semibold"
                          : "bg-neutral-800/40 border-transparent text-[#9ca3af] hover:text-white hover:bg-neutral-850"
                      }`}
                      title={pr.name}
                    >
                      {pr.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                  Description / Documentation SUMMARY
                </label>
                <textarea
                  placeholder="Summarize features or command bindings loaded by this addon extension..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-[#0d0e12] border border-white/10 rounded-lg py-2 px-3 text-xs text-white focus:outline-hidden focus:border-indigo-500 font-sans resize-none"
                />
              </div>
            </div>
          </div>

          {/* Interactive Source Form Area */}
          {sourceType === "download_link" ? (
            <div className="space-y-2 bg-black/30 p-4 rounded-xl border border-white/5 animate-fadeIn">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                  Direct Download URL Link <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    placeholder="e.g. https://github.com/EngineHub/WorldEdit/releases/download/v7.2.14/worldedit-bukkit-7.2.14.jar"
                    value={downloadUrl}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDownloadUrl(val);
                      // Auto extract filename from link path
                      try {
                        const parsed = new URL(val);
                        const paths = parsed.pathname.split("/");
                        const last = paths[paths.length - 1];
                        if (last && last.includes(".")) {
                          setFileName(last);
                        }
                      } catch (err) {
                        const parts = val.split("/");
                        const last = parts[parts.length - 1];
                        if (last && last.includes(".")) {
                          setFileName(last);
                        }
                      }
                    }}
                    className="w-full bg-[#0d0e12] border border-white/10 rounded-lg py-2.5 pl-3 pr-10 text-xs text-white  font-mono placeholder:text-gray-600 focus:outline-hidden focus:border-indigo-500"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">
                    <LinkIcon className="w-3.5 h-3.5 text-indigo-400/80" />
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 leading-normal">
                  The Node Cluster daemon will dynamically stream payload chunks from this link into `/plugins` directory when servers install this plugin.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                Local Binary File Upload Zone
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleRealFileUpload}
                accept=".jar,.zip,.war,.json"
                className="hidden"
              />
              <div 
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-white/10 hover:border-indigo-500/40 bg-black/40 hover:bg-black/60 p-5 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all gap-1.5 group select-none"
              >
                <UploadCloud className={`w-8 h-8 text-gray-500 group-hover:text-indigo-400 transition-colors ${isUploading ? "animate-bounce text-indigo-450" : ""}`} />
                {isUploading ? (
                  <span className="text-xs text-indigo-400 font-semibold animate-pulse">Hashing chunk streams... Please wait.</span>
                ) : (
                  <div className="space-y-0.5">
                    <span className="text-xs text-gray-300 font-medium block">
                      {uploadedFile ? `Attached File: ${uploadedFile.name}` : (fileName ? `Attached: ${fileName}` : "Drag and drop `.jar` plugin asset here")}
                    </span>
                    <span className="text-[10px] text-gray-500 block">
                      Or click to browse your desktop storage.
                    </span>
                  </div>
                )}
              </div>
              <div className="flex justify-end mt-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSimulateDragDrop();
                  }}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer font-sans select-none underline"
                >
                  Need file mock? Click to auto-generate from Name/Version
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
            <button
              type="button"
              onClick={() => {
                setShowCreateForm(false);
                setErrorMessage("");
              }}
              className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-650 hover:bg-indigo-550 text-white rounded-lg text-xs font-semibold shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Deploy System Plugin
            </button>
          </div>
        </form>
      )}

      {/* Plugins Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plugins.map((pl) => (
          <div key={pl.id} className="bg-[#11121d] p-5 rounded-xl border border-white/5 flex flex-col justify-between shadow-xs relative overflow-hidden group">
            {/* Visual backdrop of custom plugin logo */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-950/10 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-4">
              <div className="flex gap-3.5 items-start">
                <img
                  src={(pl.imageUrl || "https://images.unsplash.com/photo-1607988795691-3d0147b43231?w=100&h=100&fit=crop") || undefined}
                  alt={pl.name}
                  className="w-12 h-12 rounded-lg object-cover bg-black border border-white/10 shrink-0 shadow-inner"
                  referrerPolicy="no-referrer"
                />
                
                <div className="space-y-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-200 truncate flex items-center gap-1.5" title={pl.name}>
                    {pl.name}
                  </h3>
                  <span className="font-mono text-[10px] text-gray-500 block leading-tight">
                    {pl.version} by <strong className="text-indigo-400 font-medium">{pl.author}</strong>
                  </span>
                  <div className="flex flex-wrap gap-1.5 items-center mt-1">
                    {pl.fileName && (
                      <span className="inline-block font-mono text-[9px] px-1.5 py-0.5 rounded bg-black text-[#10b981]/80 border border-emerald-500/10" title="Target File Name">
                        {pl.fileName}
                      </span>
                    )}
                    {pl.sourceType === "download_link" ? (
                      <span className="inline-flex items-center gap-1 font-mono text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/15" title={pl.downloadUrl}>
                        <LinkIcon className="w-2.5 h-2.5" /> Link Source
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-mono text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/15" title="Local binary asset loaded">
                        <UploadCloud className="w-2.5 h-2.5" /> Local Binary
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-400 leading-relaxed font-sans mt-2 min-h-[36px]">
                {pl.description}
              </p>
            </div>

            <div className="pt-4 border-t border-white/4 mt-4 flex justify-between items-center text-xs">
              <span className="font-mono text-[9px] text-[#9ca3af]/40 uppercase tracking-wider select-all">{pl.id}</span>

              <div className="flex items-center gap-2">
                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => onDeletePlugin(pl.id)}
                  className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg border border-transparent hover:border-red-500/10 transition-all select-none cursor-pointer"
                  title="Remove Plugin Completely"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* Toggle button */}
                <button
                  id={`btn-plugin-toggle-${pl.id}`}
                  onClick={() => onTogglePlugin(pl.id)}
                  className="text-gray-400 hover:text-white transition-colors cursor-pointer select-none"
                  title={pl.isEnabled ? "Deactivate Extension" : "Activate Extension"}
                >
                  {pl.isEnabled ? (
                    <ToggleRight className="w-10 h-10 text-[#10b981] fill-current" />
                  ) : (
                    <ToggleLeft className="w-10 h-10 text-gray-600" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}

        {plugins.length === 0 && (
          <div className="col-span-full py-16 text-center italic text-gray-500 bg-black/20 border border-dashed border-white/5 rounded-xl">
            No system plugins configured. Click "Register & Upload Plugin" to define software packages.
          </div>
        )}
      </div>
    </div>
  );
}
