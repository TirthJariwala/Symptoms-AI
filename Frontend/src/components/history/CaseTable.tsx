"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
  FileText,
  ChevronUp,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { useCases } from "@/lib/hooks/useCases";
import { caseToRow } from "@/lib/utils/caseHelpers";
import { LiveIndicator } from "@/components/common/LiveIndicator";

const STATUS = {
  confirmed: { icon: CheckCircle2, color: "text-[#2DC653]", bg: "bg-[#E8F9EE]", label: "Confirmed" },
  flagged: { icon: AlertTriangle, color: "text-[#F4A261]", bg: "bg-[#FEF3E8]", label: "Flagged" },
  review: { icon: Clock, color: "text-[#3B6FD4]", bg: "bg-[#EEF3FC]", label: "In Review" },
};

const CONF_COLOR = (c: number) => (c >= 85 ? "#2DC653" : c >= 70 ? "#F4A261" : "#E63946");

type SortKey = "case_id" | "confidence" | "date";
type SortDir = "asc" | "desc";

export function CaseTable() {
  const { cases, loading, error, lastUpdated } = useCases(true, true);
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({
    key: "date",
    dir: "desc",
  });

  const rows = useMemo(() => cases.map(caseToRow), [cases]);

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      let diff = 0;
      if (sort.key === "case_id") diff = a.case_id.localeCompare(b.case_id);
      if (sort.key === "confidence") diff = a.confidence - b.confidence;
      if (sort.key === "date") diff = a.date.localeCompare(b.date);
      return sort.dir === "asc" ? diff : -diff;
    });
  }, [rows, sort]);

  const toggleSort = (key: SortKey) => {
    setSort((s) => ({ key, dir: s.key === key && s.dir === "asc" ? "desc" : "asc" }));
  };

  const SortIcon = ({ k }: { k: SortKey }) =>
    sort.key === k ? (
      sort.dir === "asc" ? (
        <ChevronUp className="w-3.5 h-3.5" />
      ) : (
        <ChevronDown className="w-3.5 h-3.5" />
      )
    ) : (
      <ChevronDown className="w-3.5 h-3.5 opacity-30" />
    );

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-card py-16 flex items-center justify-center gap-2 text-[#64748B]">
        <Loader2 className="w-5 h-5 animate-spin" />
        Loading case history...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-card py-12 text-center text-[#E63946] text-sm">
        {error}
      </div>
    );
  }

  if (sorted.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-card py-12 text-center">
        <p className="text-[#64748B] text-sm">No analyzed cases yet.</p>
        <Link href="/upload" className="text-[#3B6FD4] font-semibold text-sm hover:underline mt-2 inline-block">
          Run your first analysis →
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-card overflow-hidden"
    >
      <div className="px-4 py-2 border-b border-[#E2E8F0] flex justify-end">
        <LiveIndicator lastUpdated={lastUpdated} />
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#E2E8F0]">
            {[
              { label: "Case ID", key: "case_id" as SortKey, w: "w-36" },
              { label: "File", key: null, w: "w-40" },
              { label: "Diagnosis", key: null, w: "" },
              { label: "Confidence", key: "confidence" as SortKey, w: "w-36" },
              { label: "Date", key: "date" as SortKey, w: "w-32" },
              { label: "Status", key: null, w: "w-32" },
              { label: "Actions", key: null, w: "w-24" },
            ].map(({ label, key, w }) => (
              <th
                key={label}
                className={`px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8] ${w} ${key ? "cursor-pointer hover:text-[#64748B] select-none" : ""}`}
                onClick={() => key && toggleSort(key)}
              >
                <div className="flex items-center gap-1">
                  {label}
                  {key && <SortIcon k={key} />}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F1F5F9]">
          {sorted.map((c, i) => {
            const st = STATUS[c.status];
            const Icon = st.icon;
            return (
              <motion.tr
                key={c.case_id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className="hover:bg-[#F8FAFC] transition-colors group"
              >
                <td className="px-4 py-4">
                  <span className="text-[12px] font-semibold text-[#1A2744] font-mono">
                    {c.case_id.slice(0, 8)}…
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className="text-[13px] text-[#64748B] truncate block max-w-[160px]">
                    {c.file_name}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className="text-[13px] font-medium text-[#1A2744]">{c.primary_diagnosis}</span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden w-16">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${c.confidence}%`, background: CONF_COLOR(c.confidence) }}
                      />
                    </div>
                    <span className="text-[13px] font-bold" style={{ color: CONF_COLOR(c.confidence) }}>
                      {c.confidence}%
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="text-[13px] text-[#64748B]">{c.date}</span>
                </td>
                <td className="px-4 py-4">
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${st.bg}`}>
                    <Icon className={`w-3.5 h-3.5 ${st.color}`} />
                    <span className={`text-[12px] font-semibold ${st.color}`}>{st.label}</span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/prediction?case_id=${c.case_id}`}
                      className="w-7 h-7 bg-[#EEF3FC] hover:bg-[#3B6FD4] text-[#3B6FD4] hover:text-white rounded-lg flex items-center justify-center transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      href={`/report?case_id=${c.case_id}`}
                      className="w-7 h-7 bg-[#F5F7FB] hover:bg-[#2A9D8F] text-[#64748B] hover:text-white rounded-lg flex items-center justify-center transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </motion.div>
  );
}
