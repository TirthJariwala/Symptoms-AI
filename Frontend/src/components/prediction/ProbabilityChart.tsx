"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#3B6FD4", "#2A9D8F", "#8B5CF6", "#F4A261", "#94A3B8", "#E63946"];

interface ProbabilityChartProps {
  predictions: Record<string, number>;
  primary_diagnosis: string;
  confidence: number;
}

function formatLabel(key: string) {
  return key
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: { name: string; probability: number } }[] }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#1A2744] text-white px-3 py-2 rounded-xl text-[12px] shadow-lg">
        <p className="font-semibold">{payload[0].payload.name}</p>
        <p className="text-[#7EB0FF]">{payload[0].payload.probability.toFixed(1)}%</p>
      </div>
    );
  }
  return null;
};

export function ProbabilityChart({
  predictions,
  primary_diagnosis,
  confidence,
}: ProbabilityChartProps) {
  const chartData = useMemo(() => {
    return Object.entries(predictions)
      .map(([key, prob]) => ({
        name: formatLabel(key),
        key,
        probability: Math.round(prob * 1000) / 10,
      }))
      .sort((a, b) => b.probability - a.probability);
  }, [predictions]);

  const confidencePct = Math.round(confidence * 1000) / 10;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-2xl shadow-card p-5"
    >
      <h3 className="font-semibold text-[#1A2744] mb-1">Disease Probability</h3>
      <p className="text-[12px] text-[#94A3B8] mb-4">AI prediction confidence per condition</p>

      <ResponsiveContainer width="100%" height={Math.max(160, chartData.length * 36)}>
        <BarChart data={chartData} layout="vertical" barSize={20}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: "#94A3B8" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 12, fill: "#64748B" }}
            axisLine={false}
            tickLine={false}
            width={100}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="probability" radius={[0, 6, 6, 0]}>
            {chartData.map((entry, i) => (
              <Cell
                key={entry.key}
                fill={COLORS[i % COLORS.length]}
                opacity={entry.key === primary_diagnosis ? 1 : 0.55}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-3 flex items-center gap-2 bg-[#EEF3FC] border border-[#3B6FD4]/20 rounded-xl px-3 py-2">
        <div className="w-2 h-2 bg-[#3B6FD4] rounded-full" />
        <span className="text-[12px] text-[#3B6FD4] font-medium">
          Primary diagnosis: <strong>{formatLabel(primary_diagnosis)}</strong> with{" "}
          {confidencePct}% confidence
        </span>
      </div>
    </motion.div>
  );
}
