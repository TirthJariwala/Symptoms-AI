"use client";

import { motion } from "framer-motion";

interface HeatmapOverlayProps {
  visible: boolean;
  intensity?: number; // 0–1
}

export function HeatmapOverlay({ visible, intensity = 0.65 }: HeatmapOverlayProps) {
  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: intensity }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="absolute inset-0 pointer-events-none"
      style={{
        background:
          "radial-gradient(ellipse 45% 35% at 52% 38%, rgba(255,80,0,0.9) 0%, rgba(255,180,0,0.6) 35%, rgba(0,200,255,0.2) 65%, transparent 80%)",
        mixBlendMode: "screen",
      }}
    />
  );
}