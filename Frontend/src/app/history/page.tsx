"use client";

import { LayoutWrapper } from "@/components/layout/LayoutWrapper";
import { CaseTable } from "@/components/history/CaseTable";
import { Filters } from "@/components/history/Filters";
export default function HistoryPage() {
  return (
    <LayoutWrapper>
      <div className="max-w-screen-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-[#1A2744]">Case History</h1>
            <p className="text-[#64748B] text-sm mt-1">
              All AI-analyzed cases — updates every 5 seconds
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-[13px] font-semibold text-[#1A2744] hover:bg-[#F5F7FB] transition-colors">
              Export CSV
            </button>
          </div>
        </div>

        <Filters />
        <CaseTable />
      </div>
    </LayoutWrapper>
  );
}