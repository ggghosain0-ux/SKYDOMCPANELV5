/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { BarChart3, LineChart, Globe, Zap, Download, RefreshCw } from "lucide-react";

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(false);
  const [ramLoad, setRamLoad] = useState([45, 48, 52, 50, 48, 54, 58, 62, 59, 64, 61, 65]);
  const [cpuLoad, setCpuLoad] = useState([20, 32, 28, 45, 52, 40, 68, 85, 42, 38, 51, 44]);
  const [packetsIn, setPacketsIn] = useState([1.2, 1.5, 1.4, 2.1, 2.8, 3.2, 4.1, 3.9, 4.2, 5.0, 4.8, 5.1]);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Shuffle values for dynamic high-fidelity representation
      setRamLoad((prev) => [...prev.slice(1), Math.floor(55 + Math.random() * 20)]);
      setCpuLoad((prev) => [...prev.slice(1), Math.floor(30 + Math.random() * 50)]);
      setPacketsIn((prev) => [...prev.slice(1), parseFloat((4.5 + Math.random() * 1.5).toFixed(1))]);
    }, 600);
  };

  const renderMultiSegmentGraph = (points: number[], maxLimit: number, strokeColor: string, fillColor: string) => {
    if (points.length === 0) return null;
    const pathPoints = points.map((val, idx) => {
      const x = (idx / (points.length - 1)) * 400;
      const y = 140 - (val / maxLimit) * 110;
      return `${x},${y}`;
    });

    const areaPoints = [
      `0,140`,
      ...pathPoints,
      `400,140`
    ].join(" ");

    return (
      <svg className="w-full h-36 overflow-visible select-none" viewBox="0 0 400 140">
        <defs>
          <linearGradient id={fillColor} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.15" className={strokeColor} />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" className={strokeColor} />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill={`url(#${fillColor})`} />
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={pathPoints.join(" ")}
          className={strokeColor}
        />
        {/* Draw subtle grid lines */}
        <line x1="0" y1="35" x2="400" y2="35" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
        <line x1="0" y1="70" x2="400" y2="70" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
        <line x1="0" y1="105" x2="400" y2="105" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
      </svg>
    );
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex justify-between items-center bg-[#11121d] p-5 rounded-xl border border-white/5 shadow-xs">
        <div>
          <h2 className="text-xl font-display font-medium text-white tracking-tight">
            Network Operations Center (NOC) Analytics
          </h2>
          <p className="text-xs text-gray-400 font-sans">
            Real-time live metric aggregations across active regions, bandwidth allocations, and Docker daemon memory loads.
          </p>
        </div>
        <button
          id="btn-refresh-analytics"
          onClick={handleRefresh}
          className="p-2 bg-neutral-800 hover:bg-neutral-750 text-gray-300 rounded-lg text-xs font-semibold flex items-center gap-2 border border-white/5 shadow-sm cursor-pointer select-none"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Recalculate Vitals
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Memory Load Card */}
        <div className="bg-[#11121d] p-5 rounded-xl border border-white/5 space-y-4 shadow-xs">
          <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Aggregate RAM Pools</span>
              <span className="text-lg font-mono font-semibold text-white">{ramLoad[ramLoad.length - 1]} GB / 224 GB</span>
            </div>
            <Zap className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="bg-black/20 p-2.5 rounded-lg border border-white/3">
            {renderMultiSegmentGraph(ramLoad, 100, "text-indigo-400", "ramGradient")}
          </div>
          <div className="flex justify-between font-mono text-[9px] text-gray-500">
            <span>-15 Minutes Ago</span>
            <span>Real-time pool loading</span>
            <span>Just Now</span>
          </div>
        </div>

        {/* CPU Load Card */}
        <div className="bg-[#11121d] p-5 rounded-xl border border-white/5 space-y-4 shadow-xs">
          <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Average Hyper-virtualization Core Load</span>
              <span className="text-lg font-mono font-semibold text-white">{cpuLoad[cpuLoad.length - 1]}% Load Average</span>
            </div>
            <LineChart className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="bg-black/20 p-2.5 rounded-lg border border-white/3">
            {renderMultiSegmentGraph(cpuLoad, 100, "text-emerald-400", "cpuGradient")}
          </div>
          <div className="flex justify-between font-mono text-[9px] text-gray-500">
            <span>-15 Minutes Ago</span>
            <span>Mean Node stress rates</span>
            <span>Just Now</span>
          </div>
        </div>

        {/* Packet Flow Card */}
        <div className="bg-[#11121d] p-5 rounded-xl border border-white/5 space-y-4 shadow-xs">
          <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Packet Stream Metrics</span>
              <span className="text-lg font-mono font-semibold text-white">{packetsIn[packetsIn.length - 1]} Million p/s</span>
            </div>
            <Globe className="w-5 h-5 text-amber-400" />
          </div>
          <div className="bg-black/20 p-2.5 rounded-lg border border-white/3">
            {renderMultiSegmentGraph(packetsIn, 10, "text-amber-400", "packetGradient")}
          </div>
          <div className="flex justify-between font-mono text-[9px] text-gray-500">
            <span>-15 Minutes Ago</span>
            <span>Aggregate networking load</span>
            <span>Just Now</span>
          </div>
        </div>
      </div>

      {/* Geolocation Distribution Cluster metrics */}
      <div className="bg-[#11121d] p-6 rounded-xl border border-white/5 space-y-4 shadow-xs">
        <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider border-b border-white/5 pb-3 block">
          Regional Server Allocation Distribution Load Matrices
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-black/20 p-4 border border-white/4 rounded-xl space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-gray-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400" /> North America Dallas Core
              </span>
              <span className="font-mono text-gray-400">Dallas AMD EPYC 01</span>
            </div>
            <div className="w-full bg-neutral-900 rounded-full h-1.5">
              <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: "68%" }}></div>
            </div>
            <div className="flex justify-between font-mono text-[10px] text-gray-500">
              <span>Memory Pool: 48GB / 128GB</span>
              <span>68% Allocated</span>
            </div>
          </div>

          <div className="bg-black/20 p-4 border border-white/4 rounded-xl space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-gray-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Europe West Frankfurt
              </span>
              <span className="font-mono text-gray-400">Frankfurt Ryzen 02</span>
            </div>
            <div className="w-full bg-neutral-900 rounded-full h-1.5">
              <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: "44%" }}></div>
            </div>
            <div className="flex justify-between font-mono text-[10px] text-gray-500">
              <span>Memory Pool: 28GB / 64GB</span>
              <span>44% Allocated</span>
            </div>
          </div>

          <div className="bg-black/20 p-4 border border-white/4 rounded-xl space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-gray-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> Asia Pacific Singapore Core
              </span>
              <span className="font-mono text-gray-400">Singapore Core I9</span>
            </div>
            <div className="w-full bg-neutral-900 rounded-full h-1.5">
              <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: "37%" }}></div>
            </div>
            <div className="flex justify-between font-mono text-[10px] text-gray-500">
              <span>Memory Pool: 12GB / 32GB</span>
              <span>37% Allocated</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
