"use client";

import { motion } from "framer-motion";
import { CheckCircle2, UserCheck, Scan, ChevronRight } from "lucide-react";

interface ActionCardProps {
  action: string;
  action_rationale: string;
}

const ACTION_CONFIG: Record<
  string,
  {
    icon: typeof CheckCircle2;
    label: string;
    color: string;
    bg: string;
    border: string;
  }
> = {
  confirm_diagnosis: {
    icon: CheckCircle2,
    label: "Confirm Diagnosis",
    color: "#2DC653",
    bg: "#E8F9EE",
    border: "#2DC653",
  },
  refer_specialist: {
    icon: UserCheck,
    label: "Refer to Specialist",
    color: "#3B6FD4",
    bg: "#EEF3FC",
    border: "#3B6FD4",
  },
  request_further_imaging: {
    icon: Scan,
    label: "Request Further Imaging",
    color: "#F4A261",
    bg: "#FEF3E8",
    border: "#F4A261",
  },
};

const DEFAULT_CONFIG = ACTION_CONFIG.confirm_diagnosis;

export function ActionCard({ action, action_rationale }: ActionCardProps) {
  const cfg = ACTION_CONFIG[action] ?? DEFAULT_CONFIG;
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="rounded-2xl shadow-card overflow-hidden"
      style={{ borderLeft: `4px solid ${cfg.border}` }}
    >
      <div style={{ background: cfg.bg }} className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${cfg.color}20` }}
          >
            <Icon className="w-5 h-5" style={{ color: cfg.color }} />
          </div>
          <div>
            <div
              className="text-[11px] font-semibold uppercase tracking-wider mb-0.5"
              style={{ color: cfg.color }}
            >
              RL Recommendation
            </div>
            <h3 className="font-semibold text-[#1A2744] text-[15px]">{cfg.label}</h3>
          </div>
        </div>
        <p className="text-[13px] text-[#475569] leading-relaxed">{action_rationale}</p>
      </div>

      <div
        className="bg-white px-5 py-3 flex items-center justify-between border-t"
        style={{ borderColor: `${cfg.color}20` }}
      >
        <span className="text-[12px] text-[#94A3B8]">Powered by Reinforcement Learning</span>
        <button
          className="flex items-center gap-1 text-[13px] font-semibold hover:underline"
          style={{ color: cfg.color }}
        >
          Take action <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
