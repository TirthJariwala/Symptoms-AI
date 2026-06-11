"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { healthApi } from "@/lib/api/healthApi";
import { useRealtimePoll } from "@/lib/hooks/useRealtime";
import { LiveIndicator } from "@/components/common/LiveIndicator";

export function DashboardHeader() {
  const user = useAuthStore((s) => s.user);
  const [aiOnline, setAiOnline] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useRealtimePoll(
    () => healthApi.systemStatus(),
    (s) => {
      setAiOnline(s.ai?.status === "healthy");
      setLastUpdated(new Date());
    },
    { intervalMs: 8000 }
  );

  const greeting = user?.full_name
    ? `Good afternoon, ${user.full_name.split(" ")[0]}`
    : "Good afternoon";

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="font-display text-2xl font-bold text-[#1A2744]">{greeting}</h1>
        <p className="text-[#64748B] text-sm mt-1">
          Clinical AI Dashboard — {new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <LiveIndicator lastUpdated={lastUpdated} />
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${
            aiOnline
              ? "bg-[#E8F9EE] border-[#2DC653]/20"
              : "bg-[#FEF3E8] border-[#F4A261]/30"
          }`}
        >
          <span
            className={`text-[13px] font-semibold ${
              aiOnline ? "text-[#2DC653]" : "text-[#F4A261]"
            }`}
          >
            {aiOnline ? "AI Service Online" : "AI Service Unreachable"}
          </span>
        </div>
      </div>
    </div>
  );
}
