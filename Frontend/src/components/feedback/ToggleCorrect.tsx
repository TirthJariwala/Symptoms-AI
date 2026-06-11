"use client";

import { CheckCircle2, XCircle } from "lucide-react";

interface ToggleCorrectProps {
  value: boolean | null;
  onChange: (v: boolean) => void;
}

export function ToggleCorrect({ value, onChange }: ToggleCorrectProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(true)}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-[13px] font-semibold transition-all ${
          value === true
            ? "bg-[#E8F9EE] border-[#2DC653] text-[#2DC653]"
            : "bg-[#F5F7FB] border-[#E2E8F0] text-[#64748B] hover:border-[#2DC653]/50"
        }`}
      >
        <CheckCircle2 className="w-4 h-4" />
        Correct
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-[13px] font-semibold transition-all ${
          value === false
            ? "bg-[#FDECEE] border-[#E63946] text-[#E63946]"
            : "bg-[#F5F7FB] border-[#E2E8F0] text-[#64748B] hover:border-[#E63946]/50"
        }`}
      >
        <XCircle className="w-4 h-4" />
        Incorrect
      </button>
    </div>
  );
}