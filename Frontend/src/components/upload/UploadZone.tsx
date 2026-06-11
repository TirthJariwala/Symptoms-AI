"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, File, X, CheckCircle2, AlertTriangle } from "lucide-react";
import {
  validateUploadFile,
  validateLikelyMedicalImage,
} from "@/lib/validators/uploadValidator";

interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  status: "queued" | "ready" | "error";
  error?: string;
}

interface UploadZoneProps {
  onFileReady?: (file: File, previewUrl: string) => void;
}

// ✅ All supported formats
const ACCEPTED = [".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".tif", ".webp", ".dcm"];
const MAX_SIZE_MB = 50;

export function UploadZone({ onFileReady }: UploadZoneProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const processFile = useCallback(
    async (f: File): Promise<UploadedFile> => {
      const basic = validateUploadFile(f);
      let error = basic.valid ? undefined : basic.error;
      if (!error) {
        const medical = await validateLikelyMedicalImage(f);
        error = medical.valid ? undefined : medical.error;
      }

      // ✅ Generate preview for standard image formats
      const isPreviewable = /\.(jpg|jpeg|png|bmp|tiff|tif|webp)$/i.test(f.name);
      const preview = isPreviewable ? URL.createObjectURL(f) : undefined;

      const entry: UploadedFile = {
        id: Math.random().toString(36).slice(2),
        file: f,
        preview,
        status: error ? "error" : "ready",
        error,
      };

      if (!error && onFileReady) {
        onFileReady(f, preview || "");
      }

      return entry;
    },
    [onFileReady]
  );

  const addFiles = useCallback(
    (raw: FileList | File[]) => {
      const arr = Array.from(raw);
      Promise.all(arr.map(processFile)).then((newFiles) => {
        setFiles((prev) => [...prev, ...newFiles]);
      });
    },
    [processFile]
  );

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  const formatSize = (bytes: number) => {
    if (bytes > 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  return (
    <div className="space-y-4">
      <motion.div
        animate={dragOver ? { scale: 1.01 } : { scale: 1 }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-colors ${
          dragOver
            ? "border-[#3B6FD4] bg-[#EEF3FC]"
            : "border-[#CBD5E1] bg-white hover:border-[#3B6FD4]/50 hover:bg-[#F8FAFF]"
        }`}
      >
        <input
          type="file"
          accept={ACCEPTED.join(",")}
          className="absolute inset-0 opacity-0 cursor-pointer"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />

        <div className="pointer-events-none">
          <div
            className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
              dragOver ? "bg-[#3B6FD4]" : "bg-[#EEF3FC]"
            }`}
          >
            <Upload
              className={`w-7 h-7 ${dragOver ? "text-white" : "text-[#3B6FD4]"}`}
            />
          </div>
          <h3 className="font-semibold text-[#1A2744] text-lg mb-2">
            {dragOver ? "Release to upload" : "Drop medical images here"}
          </h3>
          <p className="text-[#64748B] text-sm">
            or{" "}
            <span className="text-[#3B6FD4] font-medium">browse files</span> to upload
          </p>
          <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
            {ACCEPTED.map((ext) => (
              <span
                key={ext}
                className="bg-[#F5F7FB] border border-[#E2E8F0] text-[#64748B] text-[11px] font-mono px-2 py-1 rounded-lg"
              >
                {ext.toUpperCase()}
              </span>
            ))}
          </div>
          <p className="text-[#94A3B8] text-[12px] mt-3">
            Accepted: JPG · PNG · BMP · TIFF · WebP · DICOM · Max {MAX_SIZE_MB}MB · Field: file
          </p>
        </div>
      </motion.div>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-card overflow-hidden"
          >
            <div className="px-5 py-3.5 border-b border-[#E2E8F0] flex items-center justify-between">
              <span className="text-sm font-semibold text-[#1A2744]">
                Selected Files ({files.length})
              </span>
              <button
                onClick={() => setFiles([])}
                className="text-[#94A3B8] hover:text-[#64748B] text-[12px]"
              >
                Clear all
              </button>
            </div>
            <div className="divide-y divide-[#F1F5F9]">
              {files.map((f) => (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  className="flex items-center gap-4 px-5 py-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#F5F7FB] flex-shrink-0 overflow-hidden border border-[#E2E8F0]">
                    {f.preview ? (
                      <img
                        src={f.preview}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <File className="w-5 h-5 text-[#94A3B8]" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium text-[#1A2744] truncate">
                        {f.file.name}
                      </span>
                      {f.status === "ready" && (
                        <CheckCircle2 className="w-4 h-4 text-[#2DC653] flex-shrink-0" />
                      )}
                      {f.error && (
                        <AlertTriangle className="w-4 h-4 text-[#E63946] flex-shrink-0" />
                      )}
                    </div>
                    <div className="text-[12px] text-[#94A3B8]">{formatSize(f.file.size)}</div>
                    {f.error && (
                      <div className="text-[12px] text-[#E63946] mt-0.5">{f.error}</div>
                    )}
                  </div>

                  <button
                    onClick={() => removeFile(f.id)}
                    className="w-7 h-7 rounded-lg hover:bg-[#F5F7FB] flex items-center justify-center flex-shrink-0"
                  >
                    <X className="w-4 h-4 text-[#94A3B8]" />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}