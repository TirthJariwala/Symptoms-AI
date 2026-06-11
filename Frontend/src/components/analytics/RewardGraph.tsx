"use client";

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

const ACTION_REWARDS = [
  { action: "Confirm Diagnosis", reward: 0.92, count: 1842 },
  { action: "Refer Specialist", reward: 0.78, count: 612 },
  { action: "Further Imaging", reward: 0.65, count: 393 },
];

const COLORS = ["#2DC653", "#3B6FD4", "#F4A261"];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#1A2744] text-white px-3 py-2 rounded-xl text-[12px] shadow-lg">
        <p className="font-semibold mb-1">{payload[0].payload.action}</p>
        <p className="text-[#7EB0FF]">Avg reward: {payload[0].value.toFixed(2)}</p>
        <p className="text-[#94A3B8]">Times taken: {payload[0].payload.count}</p>
      </div>
    );
  }
  return null;
};

export function RewardGraph() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="bg-white rounded-2xl shadow-card p-6"
    >
      <div className="mb-5">
        <h3 className="font-semibold text-[#1A2744]">Average Reward by Action</h3>
        <p className="text-[12px] text-[#94A3B8] mt-0.5">
          How well each RL action performs on average
        </p>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={ACTION_REWARDS} barSize={48}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
          <XAxis
            dataKey="action"
            tick={{ fontSize: 11, fill: "#94A3B8" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 1]}
            tick={{ fontSize: 11, fill: "#94A3B8" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="reward" radius={[8, 8, 0, 0]}>
            {ACTION_REWARDS.map((_, i) => (
              <Cell key={i} fill={COLORS[i]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-3 gap-3 mt-4">
        {ACTION_REWARDS.map((a, i) => (
          <div key={a.action} className="bg-[#F8FAFC] rounded-xl p-3 text-center">
            <div className="text-[18px] font-bold font-display" style={{ color: COLORS[i] }}>
              {a.reward.toFixed(2)}
            </div>
            <div className="text-[11px] text-[#94A3B8] mt-0.5">{a.count} cases</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}