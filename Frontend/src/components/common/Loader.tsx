"use client";

import { motion } from "framer-motion";
import { Activity } from "lucide-react";

interface LoaderProps {
  text?: string;
  fullScreen?: boolean;
}

export function Loader({ text = "Analyzing...", fullScreen }: LoaderProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="w-14 h-14 rounded-full border-4 border-[#E2E8F0] border-t-[#3B6FD4] animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Activity className="w-5 h-5 text-[#3B6FD4]" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-[#1A2744] font-semibold">{text}</p>
        <p className="text-[#94A3B8] text-[13px] mt-0.5">Please wait...</p>
      </div>

      {/* Skeleton bars */}
      <div className="w-48 space-y-2 mt-2">
        {[100, 75, 88].map((w, i) => (
          <motion.div
            key={i}
            className="h-2 bg-[#E2E8F0] rounded-full skeleton"
            style={{ width: `${w}%` }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-[#F5F7FB]/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-16">
      {content}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow-card p-5 space-y-3">
      <div className="skeleton h-4 w-24 rounded-lg" />
      <div className="skeleton h-8 w-32 rounded-lg" />
      <div className="skeleton h-3 w-full rounded-lg" />
      <div className="skeleton h-3 w-3/4 rounded-lg" />
    </div>
  );
}