"use client";

import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight } from "lucide-react";

interface LowConfidenceAlertProps {
  confidence: number;
  low_confidence_flag: boolean;
  threshold?: number;
}

export function LowConfidenceAlert({
  confidence,
  low_confidence_flag,
  threshold = 0.7,
}: LowConfidenceAlertProps) {
  const confidencePct = Math.round(confidence * 1000) / 10;
  const thresholdPct = Math.round(threshold * 100);

  if (!low_confidence_flag && confidence >= threshold) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#FEF3E8] border border-[#F4A261]/40 rounded-2xl p-4"
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 bg-[#F4A261]/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-[#F4A261]" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-[#92400E] mb-1">Low Confidence Alert</h4>
          <p className="text-[13px] text-[#B45309] leading-relaxed">
            AI confidence is <strong>{confidencePct}%</strong>, below the clinical threshold of{" "}
            <strong>{thresholdPct}%</strong>. This case requires senior radiologist review before
            any clinical action is taken.
          </p>
          <button className="flex items-center gap-1.5 mt-3 text-[13px] font-semibold text-[#D97706] hover:underline">
            Escalate to senior review <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
