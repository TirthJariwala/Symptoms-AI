/**
 * Exact AI service PredictionResponse contract (snake_case, unmodified).
 * POST /api/v1/predict → multipart field "file"
 */
export interface PredictionResponse {
  case_id: string;
  predictions: Record<string, number>;
  primary_diagnosis: string;
  confidence: number;
  action: string;
  action_rationale: string;
  gradcam_url: string | null;
  low_confidence_flag: boolean;
  severity: string;
  timestamp: string;
  model_version: string;
}

export interface PredictOptions {
  cnn_architecture?: string;
  patient_age?: number;
  patient_sex?: "M" | "F" | "O";
}
