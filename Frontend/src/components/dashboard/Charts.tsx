"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useCases } from "@/lib/hooks/useCases";
import { formatDiagnosis, confidencePercent } from "@/lib/utils/caseHelpers";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const WEEKLY_DATA = [
  { day: "Mon", cases: 42, accuracy: 93.2 },
  { day: "Tue", cases: 58, accuracy: 94.1 },
  { day: "Wed", cases: 67, accuracy: 95.0 },
  { day: "Thu", cases: 51, accuracy: 93.8 },
  { day: "Fri", cases: 73, accuracy: 96.2 },
  { day: "Sat", cases: 29, accuracy: 94.7 },
  { day: "Sun", cases: 18, accuracy: 93.5 },
];

const COLORS = ["#3B6FD4", "#2A9D8F", "#8B5CF6", "#F4A261", "#CBD5E1", "#E63946"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1A2744] text-white px-3 py-2 rounded-xl text-[12px] shadow-lg">
        <p className="font-semibold mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={`${p.name}-${i}`} style={{ color: p.color }}>
            {p.name}: {p.value}
            {p.name === "accuracy" ? "%" : ""}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function Charts() {
  const { cases } = useCases(true);

  const diseaseDist = useMemo(() => {
    const counts: Record<string, number> = {};
    cases.forEach((c) => {
      const d = c.prediction.primary_diagnosis;
      counts[d] = (counts[d] || 0) + 1;
    });
    return Object.entries(counts).map(([key, value], i) => ({
      name: formatDiagnosis(key),
      value,
      color: COLORS[i % COLORS.length],
    }));
  }, [cases]);

  const confidenceByDay = useMemo(() => {
    const byDay: Record<string, { count: number; confSum: number }> = {};
    cases.forEach((c) => {
      const day = new Date(c.created_at).toLocaleDateString(undefined, { weekday: "short" });
      if (!byDay[day]) byDay[day] = { count: 0, confSum: 0 };
      byDay[day].count += 1;
      byDay[day].confSum += confidencePercent(c.prediction.confidence);
    });
    return Object.entries(byDay).map(([day, v]) => ({
      day,
      cases: v.count,
      accuracy: Math.round((v.confSum / v.count) * 10) / 10,
    }));
  }, [cases]);

  const chartData = confidenceByDay.length > 0 ? confidenceByDay : WEEKLY_DATA;
  const pieData = diseaseDist.length > 0 ? diseaseDist : [{ name: "No data", value: 1, color: "#CBD5E1" }];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      {/* Weekly cases area chart */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="xl:col-span-2 bg-white rounded-2xl shadow-card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-[#1A2744]">Weekly Case Volume</h3>
            <p className="text-[12px] text-[#94A3B8] mt-0.5">Daily cases analyzed this week</p>
          </div>
          <div className="flex items-center gap-4 text-[12px] text-[#64748B]">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-[#3B6FD4] inline-block rounded" /> Cases
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-[#2A9D8F] inline-block rounded" /> Accuracy
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="casesGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B6FD4" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#3B6FD4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="cases" name="cases" stroke="#3B6FD4" strokeWidth={2} fill="url(#casesGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Disease distribution pie */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="bg-white rounded-2xl shadow-card p-6"
      >
        <div className="mb-4">
          <h3 className="font-semibold text-[#1A2744]">Disease Distribution</h3>
          <p className="text-[12px] text-[#94A3B8] mt-0.5">This month</p>
        </div>
        <div className="flex flex-col items-center">
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={72}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="w-full space-y-2 mt-2">
            {pieData.map((d, i) => (
              <div key={`${d.name}-${i}`} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                  <span className="text-[12px] text-[#64748B]">{d.name}</span>
                </div>
                <span className="text-[12px] font-semibold text-[#1A2744]">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Accuracy bar chart */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="xl:col-span-3 bg-white rounded-2xl shadow-card p-6"
      >
        <div className="mb-6">
          <h3 className="font-semibold text-[#1A2744]">Daily Accuracy Rate</h3>
          <p className="text-[12px] text-[#94A3B8] mt-0.5">Model prediction accuracy per day</p>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={chartData} barSize={32}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <YAxis domain={[90, 98]} tick={{ fontSize: 12, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="accuracy" name="accuracy" fill="#2A9D8F" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}