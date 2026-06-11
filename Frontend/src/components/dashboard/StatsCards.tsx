"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  Server,
} from "lucide-react";
import { useCases } from "@/lib/hooks/useCases";
import { healthApi } from "@/lib/api/healthApi";
import { confidencePercent } from "@/lib/utils/caseHelpers";

export function StatsCards() {
  const { cases } = useCases(true);
  const [aiOnline, setAiOnline] = useState(true);

  useEffect(() => {
    healthApi.systemStatus().then((s) => setAiOnline(s.ai?.status === "healthy")).catch(() => setAiOnline(false));
  }, []);

  const total = cases.length;
  const flagged = cases.filter((c) => c.prediction.low_confidence_flag).length;
  const avgConfidence =
    total > 0
      ? cases.reduce((s, c) => s + confidencePercent(c.prediction.confidence), 0) / total
      : 0;

  const STATS = [
    {
      label: "Total Cases",
      value: String(total),
      delta: total > 0 ? "From your analyses" : "Upload to begin",
      deltaPositive: true,
      icon: Activity,
      color: "#3B6FD4",
      bg: "#EEF3FC",
    },
    {
      label: "Avg. Confidence",
      value: total > 0 ? `${avgConfidence.toFixed(1)}%` : "—",
      delta: "Across all cases",
      deltaPositive: avgConfidence >= 70,
      icon: CheckCircle2,
      color: "#2DC653",
      bg: "#E8F9EE",
    },
    {
      label: "AI Service",
      value: aiOnline ? "Online" : "Offline",
      delta: aiOnline ? "Connected" : "Check port 8000",
      deltaPositive: aiOnline,
      icon: Server,
      color: aiOnline ? "#2A9D8F" : "#E63946",
      bg: aiOnline ? "#E8F6F4" : "#FDECEE",
    },
    {
      label: "Low Confidence Flags",
      value: String(flagged),
      delta: flagged > 0 ? "Require review" : "None flagged",
      deltaPositive: flagged === 0,
      icon: AlertTriangle,
      color: "#F4A261",
      bg: "#FEF3E8",
    },
    {
      label: "Pathology Cases",
      value: String(cases.filter((c) => c.prediction.severity === "pathology").length),
      delta: "Severity: pathology",
      deltaPositive: false,
      icon: Clock,
      color: "#8B5CF6",
      bg: "#F3EFFE",
    },
    {
      label: "Model Version",
      value: cases[0]?.prediction.model_version || "1.0.0",
      delta: "Latest prediction",
      deltaPositive: true,
      icon: TrendingUp,
      color: "#E63946",
      bg: "#FDECEE",
    },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
      {STATS.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.4 }}
            className="bg-white rounded-2xl p-5 shadow-card card-interactive"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: stat.bg }}
              >
                <Icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
            </div>
            <div className="font-display text-2xl font-bold text-[#1A2744] mb-1">{stat.value}</div>
            <div className="text-[#64748B] text-[13px] font-medium mb-2">{stat.label}</div>
            <div
              className={`text-[12px] font-medium ${
                stat.deltaPositive ? "text-[#2DC653]" : "text-[#F4A261]"
              }`}
            >
              {stat.delta}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
