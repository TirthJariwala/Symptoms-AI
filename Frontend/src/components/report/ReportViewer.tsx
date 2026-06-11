"use client";

import { motion } from "framer-motion";
import { Activity, Calendar, Hash, CheckCircle2 } from "lucide-react";
import type { ClinicalReport } from "@/types/case";
import { formatDiagnosis, confidencePercent } from "@/lib/utils/caseHelpers";
import { resolveGradcamUrl } from "@/lib/utils/gradcam";
import { buildClinicalNarrative } from "@/lib/utils/clinicalReportNarrative";

interface ReportViewerProps {
  report: ClinicalReport;
}

const ACTION_LABELS: Record<string, string> = {
  confirm_diagnosis: "Confirm Diagnosis",
  refer_specialist: "Refer to Specialist",
  request_further_imaging: "Request Further Imaging",
};

export function ReportViewer({ report }: ReportViewerProps) {
  const p = report.prediction;
  const narrative = buildClinicalNarrative(report);
  const heatmapUrl = resolveGradcamUrl(p.gradcam_url);
  const imagePreview =
    typeof window !== "undefined"
      ? sessionStorage.getItem("uploadedImagePreview")
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-card overflow-hidden"
    >
      <div className="bg-[#1A2744] px-8 py-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-[#3B6FD4] rounded-lg flex items-center justify-center">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-display font-semibold">Symptoms AI — Clinical Report</span>
            </div>
            <h1 className="text-white font-display text-2xl font-bold mt-3 capitalize">
              {formatDiagnosis(p.primary_diagnosis)}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[#7EB0FF] text-[13px] font-mono">Case {report.case_id}</span>
              <span className="text-white/30">|</span>
              <span className="text-[#7EB0FF] text-[13px] capitalize">Severity: {p.severity}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[#94A3B8] text-[12px]">Report generated</div>
            <div className="text-white font-medium">
              {new Date(report.created_at).toLocaleString()}
            </div>
            <div className="mt-2 text-[#7EB0FF] text-[12px]">Model v{p.model_version}</div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        <section className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-6">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-[#3B6FD4] mb-3">
            Plain English Clinical Summary (for physicians)
          </h2>
          <pre className="whitespace-pre-wrap font-sans text-[14px] text-[#334155] leading-relaxed">
            {narrative}
          </pre>
        </section>

        <section>
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8] mb-3">
            Case Information
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Hash, label: "Case ID", value: report.case_id },
              { icon: Activity, label: "File", value: report.file_name || "—" },
              { icon: Calendar, label: "Analyzed", value: new Date(report.created_at).toLocaleDateString() },
              { icon: Activity, label: "Severity", value: p.severity },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-[#F8FAFC] rounded-xl p-3">
                <div className="text-[10px] text-[#94A3B8] uppercase tracking-wider mb-0.5">{label}</div>
                <div className="text-[13px] font-semibold text-[#1A2744] truncate">{value}</div>
              </div>
            ))}
          </div>
        </section>

        {(imagePreview || heatmapUrl) && (
          <section>
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8] mb-3">
              Medical Image Analysis
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {imagePreview && (
                <div className="bg-black rounded-xl overflow-hidden aspect-square flex items-center justify-center">
                  <img
                    src={imagePreview}
                    alt="Original scan"
                    className="max-h-full object-contain"
                    style={{ filter: "grayscale(1)" }}
                  />
                </div>
              )}
              {heatmapUrl && (
                <div className="bg-black rounded-xl overflow-hidden aspect-square flex items-center justify-center">
                  <img
                    src={heatmapUrl}
                    alt="Grad-CAM"
                    className="max-h-full object-contain"
                  />
                </div>
              )}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8] mb-3">
            AI Prediction Results
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 bg-[#EEF3FC] rounded-xl p-4">
              <div className="text-[11px] text-[#3B6FD4] font-semibold uppercase tracking-wider mb-1">
                Primary Diagnosis
              </div>
              <div className="font-display text-xl font-bold text-[#1A2744] capitalize">
                {formatDiagnosis(p.primary_diagnosis)}
              </div>
              <p className="text-[13px] text-[#64748B] mt-2">{p.action_rationale}</p>
            </div>
            <div className="bg-[#E8F9EE] rounded-xl p-4 flex flex-col items-center justify-center">
              <div className="font-display text-4xl font-bold text-[#2DC653]">
                {confidencePercent(p.confidence)}%
              </div>
              <div className="text-[12px] text-[#2DC653] font-semibold mt-1">Confidence</div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.entries(p.predictions).map(([disease, prob]) => (
              <div key={disease} className="bg-[#F8FAFC] rounded-lg px-3 py-2 flex justify-between">
                <span className="text-[12px] text-[#64748B] capitalize">{formatDiagnosis(disease)}</span>
                <span className="text-[12px] font-bold text-[#1A2744]">
                  {(prob * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8] mb-3">
            Recommended Action
          </h2>
          <div className="bg-[#E8F9EE] border border-[#2DC653]/30 rounded-xl px-5 py-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#2DC653] flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-[#1A2744]">
                {ACTION_LABELS[p.action] || p.action}
              </div>
              <div className="text-[13px] text-[#64748B] mt-1">{p.action_rationale}</div>
            </div>
          </div>
        </section>

        <section className="border-t border-[#E2E8F0] pt-4 print:block">
          <p className="text-[11px] text-[#94A3B8] leading-relaxed">
            <strong>Clinical Decision Support Notice:</strong> This English report is generated by
            Symptoms AI for physician review only. It does not replace professional medical
            judgment. Case ID: {report.case_id}
          </p>
        </section>
      </div>
    </motion.div>
  );
}
