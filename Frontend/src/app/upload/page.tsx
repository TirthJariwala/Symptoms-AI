"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";
import { UploadZone } from "@/components/upload/UploadZone";
import { Info, Shield, ArrowRight, Loader2, AlertTriangle } from "lucide-react";
import { usePrediction } from "@/lib/hooks/usePrediction";

export default function UploadPage() {
  const router = useRouter();
  const { predict, loading, error } = usePrediction();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileReady = (file: File, previewUrl: string) => {
    setUploadedFile(file);
    setPreview(previewUrl || null);
  };

  const handleAnalyze = async () => {
    if (!uploadedFile) return;

    if (preview) {
      sessionStorage.setItem("uploadedImagePreview", preview);
      sessionStorage.setItem("uploadedFileName", uploadedFile.name);
      sessionStorage.setItem("uploadedFileType", uploadedFile.type);
    }

    const result = await predict(uploadedFile);
    if (result) {
      router.push("/prediction");
    }
  };

  const canAnalyze = uploadedFile && (preview || uploadedFile.name.endsWith(".dcm"));

  return (
    <LayoutWrapper>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#1A2744]">
            Upload Medical Images
          </h1>
          <p className="text-[#64748B] text-sm mt-1">
            Upload DICOM scans for X-Ray, MRI, or CT AI-assisted analysis
          </p>
        </div>

        <div className="flex items-start gap-3 bg-[#EEF3FC] border border-[#3B6FD4]/20 rounded-xl px-4 py-3">
          <Info className="w-4 h-4 text-[#3B6FD4] flex-shrink-0 mt-0.5" />
          <p className="text-[13px] text-[#3B6FD4]">
            <strong>Clinical Decision Support Only.</strong> AI predictions are assistive tools.
            All diagnoses must be confirmed by a licensed clinician. Authentication required.
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-3 bg-[#FEE2E2] border border-[#E63946]/30 rounded-xl px-4 py-3">
            <AlertTriangle className="w-4 h-4 text-[#E63946] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] text-[#E63946]">{error}</p>
              {error.includes("logged in") && (
                <a href="/login" className="text-[12px] font-semibold text-[#3B6FD4] hover:underline mt-1 inline-block">
                  Go to login →
                </a>
              )}
            </div>
          </div>
        )}

        <UploadZone onFileReady={handleFileReady} />

        {canAnalyze && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-card p-5"
          >
            <div className="flex items-center gap-5">
              {preview && (
                <div className="w-24 h-24 rounded-xl overflow-hidden border border-[#E2E8F0] bg-black flex-shrink-0">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-contain"
                    style={{ filter: "grayscale(1)" }}
                  />
                </div>
              )}

              <div className="flex-1">
                <p className="font-semibold text-[#1A2744] text-[14px]">{uploadedFile.name}</p>
                <p className="text-[#94A3B8] text-[12px] mt-0.5">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB —{" "}
                  {uploadedFile.type || "DICOM"}
                </p>
                <p className="text-[#2DC653] text-[12px] font-semibold mt-1">
                  Ready for analysis
                </p>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleAnalyze}
                disabled={loading}
                className="flex items-center gap-2 bg-[#3B6FD4] hover:bg-[#2A57B8] disabled:opacity-60 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-[14px] flex-shrink-0"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    Run AI Analysis
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </div>

            {loading && (
              <div className="mt-4">
                <div className="h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "90%" }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                    className="h-full bg-[#3B6FD4] rounded-full"
                  />
                </div>
                <p className="text-[12px] text-[#64748B] mt-2">
                  Forwarding to AI service via backend...
                </p>
              </div>
            )}
          </motion.div>
        )}

        <div className="flex items-center gap-2 text-[#94A3B8] text-[12px]">
          <Shield className="w-3.5 h-3.5" />
          <span>All uploads are encrypted in transit. HIPAA-compliant storage.</span>
        </div>
      </div>
    </LayoutWrapper>
  );
}
