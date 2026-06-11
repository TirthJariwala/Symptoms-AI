"use client";

import { motion } from "framer-motion";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  message?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({
  title = "No data found",
  message = "There are no records to display yet.",
  action,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="w-16 h-16 bg-[#EEF3FC] rounded-2xl flex items-center justify-center mb-4">
        <Inbox className="w-8 h-8 text-[#3B6FD4]" />
      </div>
      <h3 className="font-display text-xl font-bold text-[#1A2744] mb-2">{title}</h3>
      <p className="text-[#64748B] text-[14px] max-w-sm">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-6 px-5 py-2.5 bg-[#3B6FD4] text-white rounded-xl font-semibold text-[13px] hover:bg-[#2A57B8] transition-colors"
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
}