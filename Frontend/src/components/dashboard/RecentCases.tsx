"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, CheckCircle2, AlertTriangle, Clock, Loader2 } from "lucide-react";
import { useCases } from "@/lib/hooks/useCases";
import { LiveIndicator } from "@/components/common/LiveIndicator";
import { caseToRow } from "@/lib/utils/caseHelpers";

const STATUS_CONFIG = {
  confirmed: { icon: CheckCircle2, color: "text-[#2DC653]", bg: "bg-[#E8F9EE]", label: "Confirmed" },
  flagged: { icon: AlertTriangle, color: "text-[#F4A261]", bg: "bg-[#FEF3E8]", label: "Flagged" },
  review: { icon: Clock, color: "text-[#3B6FD4]", bg: "bg-[#EEF3FC]", label: "In Review" },
};

const CONFIDENCE_COLOR = (c: number) =>
  c >= 85 ? "#2DC653" : c >= 70 ? "#F4A261" : "#E63946";

export function RecentCases() {
  const { cases, loading, error, lastUpdated } = useCases(true, true);
  const rows = cases.slice(0, 5).map(caseToRow);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="bg-white rounded-2xl shadow-card overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-[#1A2744]">Recent Cases</h3>
          <p className="text-[12px] text-[#94A3B8] mt-0.5">Latest AI-analyzed scans</p>
        </div>
        <div className="flex items-center gap-3">
          <LiveIndicator lastUpdated={lastUpdated} />
          <Link
            href="/history"
            className="flex items-center gap-1 text-[#3B6FD4] text-[13px] font-medium hover:underline"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12 text-[#64748B] gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading cases...
        </div>
      )}

      {error && (
        <div className="px-6 py-8 text-center text-[#E63946] text-sm">{error}</div>
      )}

      {!loading && !error && rows.length === 0 && (
        <div className="px-6 py-10 text-center">
          <p className="text-[#64748B] text-sm">No cases yet.</p>
          <Link href="/upload" className="text-[#3B6FD4] text-sm font-semibold hover:underline mt-2 inline-block">
            Upload your first scan →
          </Link>
        </div>
      )}

      <div className="divide-y divide-[#F1F5F9]">
        {rows.map((c, i) => {
          const st = STATUS_CONFIG[c.status];
          const Icon = st.icon;
          return (
            <motion.div
              key={c.case_id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 + i * 0.05 }}
            >
              <Link
                href={`/prediction?case_id=${c.case_id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-[#F8FAFC] transition-colors group"
              >
                <div className="w-24 flex-shrink-0">
                  <div className="text-[13px] font-semibold text-[#1A2744] font-mono truncate">
                    {c.case_id.slice(0, 8)}…
                  </div>
                  <div className="text-[11px] text-[#94A3B8] truncate">{c.file_name}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-semibold text-[#1A2744]">{c.primary_diagnosis}</div>
                </div>
                <div className="text-right flex-shrink-0 w-20">
                  <div
                    className="text-[15px] font-bold font-display"
                    style={{ color: CONFIDENCE_COLOR(c.confidence) }}
                  >
                    {c.confidence}%
                  </div>
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${st.bg} flex-shrink-0`}>
                  <Icon className={`w-3.5 h-3.5 ${st.color}`} />
                  <span className={`text-[12px] font-semibold ${st.color}`}>{st.label}</span>
                </div>
                <div className="text-[12px] text-[#94A3B8] w-24 text-right flex-shrink-0">{c.date}</div>
                <ArrowRight className="w-4 h-4 text-[#CBD5E1] group-hover:text-[#3B6FD4] transition-colors flex-shrink-0" />
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
