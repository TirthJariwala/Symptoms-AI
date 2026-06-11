"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";

interface UploadProgressProps {
  fileName: string;
  progress: number;
  done?: boolean;
}

export function UploadProgress({ fileName, progress, done }: UploadProgressProps) {
  return (
    <div className="flex items-center gap-3 py-2">
      {done ? (
        <CheckCircle2 className="w-5 h-5 text-[#2DC653] flex-shrink-0" />
      ) : (
        <Loader2 className="w-5 h-5 text-[#3B6FD4] animate-spin flex-shrink-0" />
      )}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[13px] font-medium text-[#1A2744] truncate max-w-[200px]">{fileName}</span>
          <span className="text-[12px] text-[#94A3B8] ml-2">{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "easeOut" }}
            className={`h-full rounded-full ${done ? "bg-[#2DC653]" : "bg-[#3B6FD4]"}`}
          />
        </div>
      </div>
    </div>
  );
}