"use client";

import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

const STATUSES = ["All", "Confirmed", "Flagged", "In Review"];
const MODALITIES = ["All", "X-Ray", "CT", "MRI", "DICOM"];

export function Filters() {
  const [status, setStatus] = useState("All");
  const [modality, setModality] = useState("All");
  const [query, setQuery] = useState("");

  return (
    <div className="bg-white rounded-2xl shadow-card px-5 py-4 flex items-center gap-4 flex-wrap">
      {/* Search */}
      <div className="relative flex-1 min-w-48">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search case ID, patient, disease..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F5F7FB] text-[13px] text-[#1A2744] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#3B6FD4]/20 focus:border-[#3B6FD4] transition-all"
        />
      </div>

      {/* Status */}
      <div className="flex items-center gap-1.5">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-3 py-2 rounded-xl text-[12px] font-semibold transition-colors ${
              status === s
                ? "bg-[#3B6FD4] text-white"
                : "bg-[#F5F7FB] text-[#64748B] hover:bg-[#EEF3FC] hover:text-[#3B6FD4]"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Modality */}
      <div className="flex items-center gap-1.5">
        {MODALITIES.map((m) => (
          <button
            key={m}
            onClick={() => setModality(m)}
            className={`px-3 py-2 rounded-xl text-[12px] font-semibold transition-colors ${
              modality === m
                ? "bg-[#2A9D8F] text-white"
                : "bg-[#F5F7FB] text-[#64748B] hover:bg-[#E8F6F4] hover:text-[#2A9D8F]"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      <button className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-[#E2E8F0] text-[#64748B] hover:bg-[#F5F7FB] transition-colors text-[13px]">
        <SlidersHorizontal className="w-4 h-4" />
        More filters
      </button>
    </div>
  );
}