"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Star, AlertTriangle, Send, Loader2 } from "lucide-react";
import { RatingStars } from "./RatingStars";
import { ToggleCorrect } from "./ToggleCorrect";
import { useFeedback } from "@/lib/hooks/useFeedback";
import { useAuthStore } from "@/store/useAuthStore";

interface FeedbackFormProps {
  case_id: string;
}

export function FeedbackForm({ case_id }: FeedbackFormProps) {
  const user = useAuthStore((s) => s.user);
  const { loading, error, submitted, response, submit, escalate } = useFeedback();
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [quality_rating, setQualityRating] = useState(0);
  const [comment, setComment] = useState("");

  const clinician_id = user?.id ? String(user.id) : "";

  const buildPayload = (escalateFlag = false) => ({
    case_id,
    correct: correct ?? false,
    quality_rating,
    comment: comment || undefined,
    escalate: escalateFlag,
    clinician_id,
  });

  const handleSubmit = async () => {
    if (correct === null || quality_rating === 0 || !clinician_id) return;
    await submit(buildPayload(false));
  };

  const handleEscalate = async () => {
    if (correct === null || quality_rating === 0 || !clinician_id) return;
    await escalate(buildPayload(true));
  };

  if (!clinician_id) {
    return (
      <div className="bg-[#FEF3E8] border border-[#F4A261]/40 rounded-2xl p-6 text-[13px] text-[#B45309]">
        Sign in to submit clinician feedback (clinician_id required by AI service).
      </div>
    );
  }

  if (submitted && response) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#E8F9EE] border border-[#2DC653]/30 rounded-2xl p-8 flex flex-col items-center text-center"
      >
        <CheckCircle2 className="w-12 h-12 text-[#2DC653] mb-3" />
        <h3 className="font-display text-xl font-bold text-[#1A2744] mb-1">Feedback Submitted</h3>
        <p className="text-[#64748B] text-sm">{response.message}</p>
        <p className="text-[#94A3B8] text-[12px] mt-2">
          Reward computed: {response.reward_computed.toFixed(3)}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-white rounded-2xl shadow-card p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-[#EEF3FC] rounded-xl flex items-center justify-center">
          <Star className="w-5 h-5 text-[#3B6FD4]" />
        </div>
        <div>
          <h3 className="font-semibold text-[#1A2744]">Clinician Feedback</h3>
          <p className="text-[12px] text-[#94A3B8]">Case {case_id}</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-[#FEE2E2] border border-[#E63946]/30 rounded-xl text-[13px] text-[#E63946]">
          {error}
        </div>
      )}

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-[#1A2744] mb-2">
            Was the AI prediction correct?
          </label>
          <ToggleCorrect value={correct} onChange={setCorrect} />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1A2744] mb-2">
            Rate the prediction quality (1–5)
          </label>
          <RatingStars value={quality_rating} onChange={setQualityRating} />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1A2744] mb-2">
            Additional comments <span className="text-[#94A3B8] font-normal">(optional)</span>
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="E.g., The heatmap correctly highlighted the right lower lobe consolidation..."
            className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] bg-[#F5F7FB] text-[#1A2744] placeholder-[#94A3B8] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#3B6FD4]/20 focus:border-[#3B6FD4] transition-all resize-none"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleEscalate}
            disabled={loading || correct === null || quality_rating === 0}
            className="flex items-center gap-2 text-[#F4A261] text-[13px] font-semibold hover:underline disabled:opacity-40"
          >
            <AlertTriangle className="w-4 h-4" />
            Escalate to senior review
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || correct === null || quality_rating === 0}
            className="flex items-center gap-2 bg-[#3B6FD4] hover:bg-[#2A57B8] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-[13px]"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Submit Feedback
          </button>
        </div>
      </div>
    </motion.div>
  );
}
