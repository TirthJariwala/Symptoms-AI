"use client";

import { Download, Printer, FileText } from "lucide-react";
import { downloadHtmlReport, downloadTextReport, reportApi } from "@/lib/api/reportApi";

interface ExportButtonsProps {
  caseId: string;
}

export function ExportButtons({ caseId }: ExportButtonsProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        type="button"
        onClick={() => reportApi.openHtmlReport(caseId)}
        className="flex items-center gap-2 bg-[#3B6FD4] hover:bg-[#2A57B8] text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-[13px]"
      >
        <FileText className="w-4 h-4" />
        View English Report
      </button>
      <button
        type="button"
        onClick={() => downloadHtmlReport(caseId)}
        className="flex items-center gap-2 bg-white border border-[#E2E8F0] text-[#1A2744] font-semibold px-4 py-2.5 rounded-xl transition-colors hover:bg-[#F5F7FB] text-[13px]"
      >
        <Download className="w-4 h-4" />
        Download HTML
      </button>
      <button
        type="button"
        onClick={() => downloadTextReport(caseId)}
        className="flex items-center gap-2 bg-white border border-[#E2E8F0] text-[#1A2744] font-semibold px-4 py-2.5 rounded-xl transition-colors hover:bg-[#F5F7FB] text-[13px]"
      >
        <Download className="w-4 h-4" />
        Download Text (.txt)
      </button>
      <button
        type="button"
        onClick={() => window.print()}
        className="flex items-center gap-2 bg-white border border-[#E2E8F0] text-[#1A2744] font-semibold px-4 py-2.5 rounded-xl transition-colors hover:bg-[#F5F7FB] text-[13px]"
      >
        <Printer className="w-4 h-4" />
        Print / Save as PDF
      </button>
    </div>
  );
}
