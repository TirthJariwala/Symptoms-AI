"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";
import { ReportViewer } from "@/components/report/ReportViewer";
import { ExportButtons } from "@/components/report/ExportButtons";
import { reportApi } from "@/lib/api/reportApi";
import type { ClinicalReport } from "@/types/case";
import { Loader2 } from "lucide-react";

function ReportContent() {
  const searchParams = useSearchParams();
  const caseId = searchParams.get("case_id") || sessionStorage.getItem("activeCaseId");
  const [report, setReport] = useState<ClinicalReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!caseId) {
      setError("No case selected. Run an analysis or open a case from history.");
      setLoading(false);
      return;
    }
    reportApi
      .getByCaseId(caseId)
      .then(setReport)
      .catch((e) => {
        setError(
          (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
            "Report not found"
        );
      })
      .finally(() => setLoading(false));
  }, [caseId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-2 text-[#64748B]">
        <Loader2 className="w-6 h-6 animate-spin" />
        Loading report...
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="bg-white rounded-2xl shadow-card p-8 text-center text-[#E63946]">
        {error || "Report unavailable"}
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#1A2744]">Clinical Report</h1>
          <p className="text-[#64748B] text-sm mt-1">
            Case {report.case_id.slice(0, 8)}… — AI-generated report
          </p>
        </div>
        <ExportButtons caseId={report.case_id} />
      </div>
      <ReportViewer report={report} />
    </>
  );
}

export default function ReportPage() {
  return (
    <LayoutWrapper>
      <div className="max-w-4xl mx-auto space-y-5">
        <Suspense fallback={<div className="py-12 text-center text-[#64748B]">Loading...</div>}>
          <ReportContent />
        </Suspense>
      </div>
    </LayoutWrapper>
  );
}
