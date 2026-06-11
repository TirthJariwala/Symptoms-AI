"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, ZoomIn, ZoomOut, RotateCcw, Maximize2 } from "lucide-react";

interface ImageViewerProps {
  imageUrl: string;
  heatmapUrl?: string;
  caseId?: string;
  severity?: string;
  timestamp?: string;
}

export function ImageViewer({
  imageUrl,
  heatmapUrl,
  caseId,
  severity,
  timestamp,
}: ImageViewerProps) {
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [zoom, setZoom] = useState(1);

  return (
    <div className="bg-[#0F172A] rounded-2xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <span className="text-white/70 text-[13px] font-medium">Medical Image Viewer</span>
        <div className="flex items-center gap-2">
          {/* Heatmap toggle */}
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors ${
              showHeatmap
                ? "bg-[#F4A261] text-white"
                : "bg-white/10 text-white/70 hover:bg-white/20"
            }`}
          >
            {showHeatmap ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            Grad-CAM {showHeatmap ? "ON" : "OFF"}
          </button>

          {/* Zoom controls */}
          <button
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
            className="w-7 h-7 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center text-white/70 hover:text-white transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-white/50 text-[12px] w-10 text-center">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
            className="w-7 h-7 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center text-white/70 hover:text-white transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="w-7 h-7 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center text-white/70 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button className="w-7 h-7 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center text-white/70 hover:text-white transition-colors">
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Image area */}
      <div className="relative aspect-square overflow-hidden flex items-center justify-center bg-[#0F172A]" style={{ maxHeight: 480 }}>
        <div style={{ transform: `scale(${zoom})`, transition: "transform 0.2s ease" }}>
          {/* Base image */}
          <img
            src={imageUrl}
            alt="Medical scan"
            className="max-w-full max-h-full object-contain"
            style={{ filter: "grayscale(1) contrast(1.1)" }}
          />

          {/* Heatmap overlay */}
          <AnimatePresence>
            {showHeatmap && heatmapUrl && (
              <motion.img
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                src={heatmapUrl}
                alt="Grad-CAM heatmap"
                className="absolute inset-0 w-full h-full object-contain"
                style={{ mixBlendMode: "screen" }}
              />
            )}
            {showHeatmap && !heatmapUrl && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.65 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse 40% 30% at 55% 40%, rgba(255,100,0,0.85) 0%, rgba(255,200,0,0.5) 40%, transparent 70%)",
                  mixBlendMode: "screen",
                }}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Heatmap legend */}
        {showHeatmap && (
          <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-lg">
            <div className="w-24 h-2 rounded-full" style={{ background: "linear-gradient(to right, #0000ff, #00ff00, #ffff00, #ff0000)" }} />
            <div className="flex items-center justify-between text-[10px] text-white/70 w-full">
              <span>Low</span>
              <span>High activation</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="px-4 py-2.5 border-t border-white/10 flex items-center gap-4 text-[11px] text-white/40 flex-wrap">
        {caseId && <span>Case {caseId.slice(0, 8)}…</span>}
        {severity && (
          <>
            <span>•</span>
            <span className="capitalize">{severity}</span>
          </>
        )}
        {timestamp && (
          <>
            <span>•</span>
            <span>{new Date(timestamp).toLocaleString()}</span>
          </>
        )}
        {heatmapUrl && (
          <>
            <span>•</span>
            <span>Grad-CAM available</span>
          </>
        )}
      </div>
    </div>
  );
}