"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bell, ChevronDown, Upload, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { useCases } from "@/lib/hooks/useCases";
import { formatDiagnosis } from "@/lib/utils/caseHelpers";

export function Navbar() {
  const user = useAuthStore((s) => s.user);
  const { cases } = useCases(true);
  const [notifOpen, setNotifOpen] = useState(false);
  const [search, setSearch] = useState("");

  const notifications = useMemo(() => {
    return cases.slice(0, 5).map((c, i) => ({
      id: i,
      text: c.prediction.low_confidence_flag
        ? `Low confidence: ${formatDiagnosis(c.prediction.primary_diagnosis)}`
        : `Analysis complete: ${formatDiagnosis(c.prediction.primary_diagnosis)}`,
      time: new Date(c.created_at).toLocaleTimeString(),
      type: c.prediction.low_confidence_flag ? ("warning" as const) : ("success" as const),
      case_id: c.case_id,
    }));
  }, [cases]);

  const initials = user?.full_name
    ? user.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : user?.email?.[0]?.toUpperCase() || "?";

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-[#E2E8F0] z-30 flex items-center px-6 gap-4">
      {/* Spacer for sidebar */}
      <div style={{ width: 260 }} className="flex-shrink-0" />

      {/* Search */}
      <div className="flex-1 max-w-sm relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search cases, patients, reports..."
          className="w-full pl-10 pr-4 py-2 bg-[#F5F7FB] border border-[#E2E8F0] rounded-xl text-[14px] text-[#1A2744] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#3B6FD4]/20 focus:border-[#3B6FD4] transition-all"
        />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Quick upload */}
        <Link
          href="/upload"
          className="flex items-center gap-2 bg-[#3B6FD4] hover:bg-[#2A57B8] text-white text-[13px] font-semibold px-4 py-2 rounded-xl transition-colors"
        >
          <Upload className="w-3.5 h-3.5" />
          Upload
        </Link>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative w-9 h-9 rounded-xl bg-[#F5F7FB] hover:bg-[#EEF3FC] border border-[#E2E8F0] flex items-center justify-center transition-colors"
          >
            <Bell className="w-4 h-4 text-[#64748B]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#E63946] rounded-full" />
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-modal border border-[#E2E8F0] overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-[#E2E8F0] flex items-center justify-between">
                  <span className="font-semibold text-[#1A2744] text-sm">Notifications</span>
                  <span className="text-[11px] text-[#3B6FD4] cursor-pointer hover:underline">Mark all read</span>
                </div>
                {notifications.length === 0 && (
                  <div className="px-4 py-6 text-center text-[#94A3B8] text-[13px]">No recent activity</div>
                )}
                {notifications.map((n) => (
                  <div key={n.id} className="px-4 py-3 hover:bg-[#F5F7FB] border-b border-[#E2E8F0] last:border-0 cursor-pointer">
                    <div className="flex items-start gap-2.5">
                      {n.type === "warning" && (
                        <AlertTriangle className="w-4 h-4 text-[#F4A261] flex-shrink-0 mt-0.5" />
                      )}
                      {n.type !== "warning" && (
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.type === "success" ? "bg-[#2DC653]" : "bg-[#3B6FD4]"}`} />
                      )}
                      <div>
                        <p className="text-[13px] text-[#1A2744]">{n.text}</p>
                        <p className="text-[11px] text-[#94A3B8] mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <button className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#F5F7FB] transition-colors">
          <div className="w-7 h-7 bg-[#3B6FD4] rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">{initials}</span>
          </div>
          <span className="text-[13px] font-medium text-[#1A2744]">
            {user?.full_name || user?.email || "User"}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />
        </button>
      </div>
    </header>
  );
}