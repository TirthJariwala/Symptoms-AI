import { create } from "zustand";
import type { PredictionResponse } from "@/types/prediction";

interface PredictionState {
  case_id: string | null;
  predictions: Record<string, number> | null;
  primary_diagnosis: string | null;
  confidence: number | null;
  action: string | null;
  action_rationale: string | null;
  gradcam_url: string | null;
  low_confidence_flag: boolean;
  severity: string | null;
  timestamp: string | null;
  model_version: string | null;
  isLoading: boolean;
  error: string | null;
  setPrediction: (data: PredictionResponse) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
  reset: () => void;
}

const initialState = {
  case_id: null,
  predictions: null,
  primary_diagnosis: null,
  confidence: null,
  action: null,
  action_rationale: null,
  gradcam_url: null,
  low_confidence_flag: false,
  severity: null,
  timestamp: null,
  model_version: null,
  isLoading: false,
  error: null,
};

export const usePredictionStore = create<PredictionState>((set) => ({
  ...initialState,
  setPrediction: (data) =>
    set({
      case_id: data.case_id,
      predictions: data.predictions,
      primary_diagnosis: data.primary_diagnosis,
      confidence: data.confidence,
      action: data.action,
      action_rationale: data.action_rationale,
      gradcam_url: data.gradcam_url,
      low_confidence_flag: data.low_confidence_flag,
      severity: data.severity,
      timestamp: data.timestamp,
      model_version: data.model_version,
      error: null,
    }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () => set(initialState),
}));
