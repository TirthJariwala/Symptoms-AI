"use client";

import { useState, useEffect } from "react";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";
import { AdminRoute } from "@/components/common/AdminRoute";
import { LiveIndicator } from "@/components/common/LiveIndicator";
import { adminApi, type AdminOverview } from "@/lib/api/adminApi";
import { useRealtimePoll } from "@/lib/hooks/useRealtime";
import { Shield, Users, Activity, Database, AlertTriangle } from "lucide-react";
import { formatDiagnosis, confidencePercent } from "@/lib/utils/caseHelpers";

export default function AdminPage() {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useRealtimePoll(
    () => adminApi.overview(),
    (data) => {
      setOverview(data);
      setLastUpdated(new Date());
      setError(null);
    },
    { intervalMs: 5000 }
  );

  useEffect(() => {
    adminApi.overview().catch((e) => {
      setError(
        (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
          "Admin access denied"
      );
    });
  }, []);

  if (error) {
    return (
      <LayoutWrapper>
        <div className="max-w-lg mx-auto py-20 text-center text-[#E63946]">{error}</div>
      </LayoutWrapper>
    );
  }

  if (!overview) {
    return (
      <LayoutWrapper>
        <div className="py-20 text-center text-[#64748B]">Loading admin panel...</div>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper>
      <AdminRoute>
        <div className="max-w-screen-xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#EEF3FC] rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#3B6FD4]" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-[#1A2744]">Admin Panel</h1>
                <p className="text-[#64748B] text-sm mt-0.5">
                  System overview — administrators only
                </p>
              </div>
            </div>
            <LiveIndicator lastUpdated={lastUpdated} />
          </div>

          <div className="bg-[#1A2744] rounded-2xl px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                label: "AI Service",
                value: overview.ai_service.status === "healthy" ? "Online" : "Offline",
              },
              { label: "Total Cases", value: String(overview.total_cases) },
              { label: "Flagged (Low Confidence)", value: String(overview.flagged_cases) },
              {
                label: "Model Version",
                value: overview.ai_service.version || "—",
              },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-[#94A3B8] text-[11px] uppercase tracking-wider mb-0.5">
                  {s.label}
                </div>
                <div className="text-white font-display text-xl font-bold">{s.value}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: Users,
                label: "All Cases",
                desc: "View every prediction stored on this server",
                count: `${overview.total_cases} cases`,
                color: "#3B6FD4",
                bg: "#EEF3FC",
              },
              {
                icon: Activity,
                label: "AI Health",
                desc: `GPU: ${overview.ai_service.gpu_available ? "Yes" : "No"} · ${overview.ai_service.environment || "—"}`,
                count: overview.ai_service.status,
                color: "#2A9D8F",
                bg: "#E8F6F4",
              },
              {
                icon: Database,
                label: "Backend",
                desc: "Express middleware proxy",
                count: overview.backend.status,
                color: "#8B5CF6",
                bg: "#F3EFFE",
              },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className="bg-white rounded-2xl shadow-card p-5">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: card.bg }}
                  >
                    <Icon className="w-6 h-6" style={{ color: card.color }} />
                  </div>
                  <h3 className="font-semibold text-[#1A2744] mb-1">{card.label}</h3>
                  <p className="text-[13px] text-[#64748B] mb-3">{card.desc}</p>
                  <span
                    className="text-[12px] font-semibold px-3 py-1 rounded-lg capitalize"
                    style={{ background: card.bg, color: card.color }}
                  >
                    {card.count}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="bg-white rounded-2xl shadow-card p-6">
            <h3 className="font-semibold text-[#1A2744] mb-4">Recent System Activity (live)</h3>
            <div className="space-y-3">
              {overview.recent_cases.length === 0 && (
                <p className="text-[#64748B] text-sm">No cases recorded yet.</p>
              )}
              {overview.recent_cases.map((c) => (
                <div
                  key={c.case_id}
                  className="flex items-start gap-3 py-2 border-b border-[#F1F5F9] last:border-0"
                >
                  {c.prediction.low_confidence_flag ? (
                    <AlertTriangle className="w-4 h-4 text-[#F4A261] flex-shrink-0 mt-0.5" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-[#2DC653] mt-2 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="text-[13px] text-[#475569]">
                      Case {c.case_id.slice(0, 8)}… —{" "}
                      <strong>{formatDiagnosis(c.prediction.primary_diagnosis)}</strong> (
                      {confidencePercent(c.prediction.confidence)}% confidence)
                      {c.prediction.low_confidence_flag && " — FLAGGED"}
                    </span>
                    <div className="text-[11px] text-[#94A3B8]">
                      {new Date(c.created_at).toLocaleString()} · {c.file_name || "image"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AdminRoute>
    </LayoutWrapper>
  );
}
