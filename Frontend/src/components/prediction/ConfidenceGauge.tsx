"use client";

import { motion } from "framer-motion";

interface ConfidenceGaugeProps {
  /** AI confidence: 0–1 */
  confidence: number;
}

const RADIUS = 56;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const ARC = CIRCUMFERENCE * 0.75;

const getColor = (v: number) => {
  if (v >= 0.85) return "#2DC653";
  if (v >= 0.7) return "#F4A261";
  return "#E63946";
};

const getLabel = (v: number) => {
  if (v >= 0.85) return "High Confidence";
  if (v >= 0.7) return "Moderate Confidence";
  return "Low Confidence — Review Required";
};

export function ConfidenceGauge({ confidence }: ConfidenceGaugeProps) {
  const valuePct = Math.round(confidence * 1000) / 10;
  const color = getColor(confidence);
  const label = getLabel(confidence);
  const offset = ARC - confidence * ARC;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-2xl shadow-card p-5"
    >
      <h3 className="font-semibold text-[#1A2744] mb-1">Confidence Score</h3>
      <p className="text-[12px] text-[#94A3B8] mb-4">Overall prediction confidence</p>

      <div className="flex flex-col items-center">
        <div className="relative w-40 h-40">
          <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
            <circle
              cx="70"
              cy="70"
              r={RADIUS}
              fill="none"
              stroke="#E2E8F0"
              strokeWidth="12"
              strokeDasharray={`${ARC} ${CIRCUMFERENCE}`}
              strokeLinecap="round"
            />
            <motion.circle
              cx="70"
              cy="70"
              r={RADIUS}
              fill="none"
              stroke={color}
              strokeWidth="12"
              strokeDasharray={`${ARC} ${CIRCUMFERENCE}`}
              strokeLinecap="round"
              initial={{ strokeDashoffset: ARC }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="font-display text-3xl font-bold"
              style={{ color }}
            >
              {valuePct}%
            </motion.span>
          </div>
        </div>

        <div
          className="mt-4 px-4 py-2 rounded-xl text-[12px] font-semibold text-center"
          style={{ background: `${color}15`, color }}
        >
          {label}
        </div>

        <div className="flex items-center justify-between w-40 mt-3 text-[10px] text-[#94A3B8]">
          <span>0%</span>
          <span className="text-[#F4A261]">70%</span>
          <span className="text-[#2DC653]">100%</span>
        </div>
      </div>
    </motion.div>
  );
}
