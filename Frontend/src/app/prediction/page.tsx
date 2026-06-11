"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";
import { ImageViewer } from "@/components/prediction/ImageViewer";
import { ProbabilityChart } from "@/components/prediction/ProbabilityChart";
import { ConfidenceGauge } from "@/components/prediction/ConfidenceGauge";
import { ActionCard } from "@/components/prediction/ActionCard";
import { PredictionSummary } from "@/components/prediction/PredictionSummary";
import { LowConfidenceAlert } from "@/components/prediction/LowConfidenceAlert";
import { FeedbackForm } from "@/components/feedback/FeedbackForm";
import { usePredictionStore } from "@/store/usePredictionStore";
import { casesApi } from "@/lib/api/casesApi";
import { syncCaseToStore } from "@/lib/sync/predictionSync";
import { resolveGradcamUrl } from "@/lib/utils/gradcam";
import { ArrowLeft, Loader2 } from "lucide-react";

function PredictionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const store = usePredictionStore();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const preview = sessionStorage.getItem("uploadedImagePreview");
    const name = sessionStorage.getItem("uploadedFileName");
    if (preview) setImageUrl(preview);
    if (name) setFileName(name);

    const caseId = searchParams.get("case_id");

    const load = async () => {
      if (caseId && (!store.case_id || store.case_id !== caseId)) {
        try {
          const record = await casesApi.getById(caseId);
          syncCaseToStore(record);
          if (record.file_name) setFileName(record.file_name);
        } catch {
          router.replace("/upload");
          return;
        }
      } else if (!store.case_id && !caseId) {
        router.replace("/upload");
        return;
      }
      setLoading(false);
    };

    load();
  }, [searchParams, store.case_id, router]);

  if (loading || !store.case_id || !store.predictions || store.confidence == null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-8 h-8 text-[#3B6FD4] animate-spin" />
        <p className="text-[#64748B] text-sm">Loading prediction...</p>
      </div>
    );
  }

  const heatmapUrl = resolveGradcamUrl(store.gradcam_url);

  return (
    <div className="max-w-screen-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/upload")}
            className="w-9 h-9 bg-white border border-[#E2E8F0] rounded-xl flex items-center justify-center hover:bg-[#F5F7FB] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-[#64748B]" />
          </button>
          <div>
            <h1 className="font-display text-2xl font-bold text-[#1A2744]">Prediction Result</h1>
            <p className="text-[#64748B] text-sm mt-0.5">
              {fileName ? `File: ${fileName} · ` : ""}
              Case {store.case_id.slice(0, 8)}…
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/upload")}
            className="px-4 py-2.5 bg-white border border-[#E2E8F0] text-[#1A2744] rounded-xl text-[13px] font-semibold hover:bg-[#F5F7FB] transition-colors"
          >
            Upload Another
          </button>
          <button
            onClick={() => router.push(`/report?case_id=${store.case_id}`)}
            className="px-4 py-2.5 bg-[#3B6FD4] text-white rounded-xl text-[13px] font-semibold hover:bg-[#2A57B8] transition-colors"
          >
            View Report
          </button>
        </div>
      </div>

      <LowConfidenceAlert
        confidence={store.confidence}
        low_confidence_flag={store.low_confidence_flag}
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div>
          <ImageViewer
            imageUrl={imageUrl || ""}
            heatmapUrl={heatmapUrl}
            caseId={store.case_id}
            severity={store.severity || ""}
            timestamp={store.timestamp || ""}
          />
        </div>
        <div className="space-y-4">
          <PredictionSummary
            case_id={store.case_id}
            primary_diagnosis={store.primary_diagnosis || ""}
            confidence={store.confidence}
            severity={store.severity || ""}
            timestamp={store.timestamp || new Date().toISOString()}
            model_version={store.model_version || ""}
          />
          <ConfidenceGauge confidence={store.confidence} />
          <ProbabilityChart
            predictions={store.predictions}
            primary_diagnosis={store.primary_diagnosis || ""}
            confidence={store.confidence}
          />
          <ActionCard
            action={store.action || "confirm_diagnosis"}
            action_rationale={store.action_rationale || ""}
          />
        </div>
      </div>

      <FeedbackForm case_id={store.case_id} />
    </div>
  );
}

export default function PredictionPage() {
  return (
    <LayoutWrapper>
      <Suspense fallback={<div className="py-16 text-center text-[#64748B]">Loading...</div>}>
        <PredictionContent />
      </Suspense>
    </LayoutWrapper>
  );
}
