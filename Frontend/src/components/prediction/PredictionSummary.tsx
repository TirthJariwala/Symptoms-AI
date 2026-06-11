"use client";

import { motion } from "framer-motion";
import { Activity, Calendar, Hash, AlertCircle } from "lucide-react";

interface PredictionSummaryProps {
  case_id: string;
  primary_diagnosis: string;
  confidence: number;
  severity: string;
  timestamp: string;
  model_version: string;
}

function formatDiagnosis(label: string) {
  return label
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatTimestamp(ts: string) {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return ts;
  }
}

export function PredictionSummary({
  case_id,
  primary_diagnosis,
  confidence,
  severity,
  timestamp,
  model_version,
}: PredictionSummaryProps) {
  const confidencePct = Math.round(confidence * 1000) / 10;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-card p-5"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-[11px] text-[#94A3B8] font-semibold uppercase tracking-wider mb-1">
            Primary Diagnosis
          </div>
          <h2 className="font-display text-2xl font-bold text-[#1A2744]">
            {formatDiagnosis(primary_diagnosis)}
          </h2>
          <span className="text-[12px] text-[#64748B] font-mono bg-[#F5F7FB] px-2 py-0.5 rounded mt-1 inline-block">
            Confidence: {confidencePct}%
          </span>
        </div>
        <div className="w-12 h-12 bg-[#EEF3FC] rounded-xl flex items-center justify-center">
          <Activity className="w-6 h-6 text-[#3B6FD4]" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#F1F5F9]">
        {[
          { icon: Hash, label: "Case ID", value: case_id },
          { icon: AlertCircle, label: "Severity", value: severity },
          { icon: Calendar, label: "Timestamp", value: formatTimestamp(timestamp) },
          { icon: Activity, label: "Model", value: model_version },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-[#94A3B8] flex-shrink-0" />
            <div>
              <div className="text-[10px] text-[#94A3B8] uppercase tracking-wider">{label}</div>
              <div className="text-[13px] font-medium text-[#1A2744] capitalize">{value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-[#F1F5F9]">
        <p className="text-[12px] text-[#94A3B8] italic">
          This AI prediction is for clinical decision support only. Final diagnosis and treatment
          decisions rest with the attending clinician.
        </p>
      </div>
    </motion.div>
  );
}
