"use client";

import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const RL_EPISODES = Array.from({ length: 20 }, (_, i) => ({
  episode: `E${i + 1}`,
  reward: 0.3 + Math.min(0.65, i * 0.035 + Math.random() * 0.06),
  accuracy: 78 + Math.min(18, i * 0.9 + Math.random() * 2),
  exploration: Math.max(0.05, 0.9 - i * 0.045),
}));

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#1A2744] text-white px-3 py-2 rounded-xl text-[12px] shadow-lg space-y-1">
        <p className="font-semibold text-[#7EB0FF]">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name}: {typeof p.value === "number" ? p.value.toFixed(3) : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function RLCharts() {
  return (
    <div className="space-y-4">
      {/* Reward over episodes */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-card p-6"
      >
        <div className="mb-5">
          <h3 className="font-semibold text-[#1A2744]">RL Reward Progression</h3>
          <p className="text-[12px] text-[#94A3B8] mt-0.5">
            Cumulative reward over training episodes — higher is better
          </p>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={RL_EPISODES}>
            <defs>
              <linearGradient id="rewardGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B6FD4" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3B6FD4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="episode" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 1]} tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="reward"
              name="reward"
              stroke="#3B6FD4"
              strokeWidth={2}
              fill="url(#rewardGrad)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Accuracy vs exploration */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        className="bg-white rounded-2xl shadow-card p-6"
      >
        <div className="mb-5">
          <h3 className="font-semibold text-[#1A2744]">Accuracy vs Exploration Rate (ε)</h3>
          <p className="text-[12px] text-[#94A3B8] mt-0.5">
            Trade-off between exploration and exploitation over training
          </p>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={RL_EPISODES}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="episode" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 12, color: "#64748B", paddingTop: 8 }}
            />
            <Line
              type="monotone"
              dataKey="accuracy"
              name="accuracy (%)"
              stroke="#2A9D8F"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="exploration"
              name="exploration (ε)"
              stroke="#F4A261"
              strokeWidth={2}
              dot={false}
              strokeDasharray="4 2"
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}