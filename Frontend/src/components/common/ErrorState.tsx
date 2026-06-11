"use client";

import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="w-16 h-16 bg-[#FDECEE] rounded-2xl flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8 text-[#E63946]" />
      </div>
      <h3 className="font-display text-xl font-bold text-[#1A2744] mb-2">{title}</h3>
      <p className="text-[#64748B] text-[14px] max-w-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 mt-6 px-5 py-2.5 bg-[#E63946] text-white rounded-xl font-semibold text-[13px] hover:bg-[#C62D38] transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Try Again
        </button>
      )}
    </motion.div>
  );
}