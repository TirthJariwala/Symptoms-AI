"use client";

import { motion } from "framer-motion";
import { Cpu, Zap, Target, TrendingUp } from "lucide-react";

const STATS = [
  {
    label: "CNN Backbone",
    value: "DenseNet-121",
    sub: "ImageNet pretrained",
    icon: Cpu,
    color: "#3B6FD4",
    bg: "#EEF3FC",
  },
  {
    label: "Inference Time",
    value: "3.2s",
    sub: "Per image (GPU)",
    icon: Zap,
    color: "#2A9D8F",
    bg: "#E8F6F4",
  },
  {
    label: "mAP Score",
    value: "0.947",
    sub: "5-class prediction",
    icon: Target,
    color: "#2DC653",
    bg: "#E8F9EE",
  },
  {
    label: "RL Policy",
    value: "PPO v2",
    sub: "Continuous improvement",
    icon: TrendingUp,
    color: "#8B5CF6",
    bg: "#F3EFFE",
  },
];

const METRICS = [
  { label: "Sensitivity (Recall)", value: 93.4, color: "#3B6FD4" },
  { label: "Specificity", value: 96.1, color: "#2A9D8F" },
  { label: "Precision", value: 91.8, color: "#2DC653" },
  { label: "F1 Score", value: 92.6, color: "#8B5CF6" },
  { label: "AUC-ROC", value: 97.2, color: "#F4A261" },
];

export function ModelStats() {
  return (
    <div className="space-y-4">
      {/* Model info cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-white rounded-2xl shadow-card p-5"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: s.bg }}
              >
                <Icon className="w-5 h-5" style={{ color: s.color }} />
              </div>
              <div className="font-display text-xl font-bold text-[#1A2744]">{s.value}</div>
              <div className="text-[12px] font-semibold text-[#64748B] mt-0.5">{s.label}</div>
              <div className="text-[11px] text-[#94A3B8] mt-0.5">{s.sub}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Performance metrics */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-card p-6"
      >
        <div className="mb-5">
          <h3 className="font-semibold text-[#1A2744]">Model Performance Metrics</h3>
          <p className="text-[12px] text-[#94A3B8] mt-0.5">
            Evaluated on held-out test set (N=4,200 cases)
          </p>
        </div>
        <div className="space-y-4">
          {METRICS.map((m) => (
            <div key={m.label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[13px] font-medium text-[#475569]">{m.label}</span>
                <span
                  className="text-[14px] font-bold font-display"
                  style={{ color: m.color }}
                >
                  {m.value}%
                </span>
              </div>
              <div className="h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${m.value}%` }}
                  transition={{ duration: 0.9, ease: "easeOut", delay: 0.4 }}
                  className="h-full rounded-full"
                  style={{ background: m.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}