import type { PredictionResponse } from "./prediction";

/** Backend case record — prediction is exact AI response. */
export interface CaseRecord {
  case_id: string;
  user_id: string | null;
  file_name: string | null;
  created_at: string;
  prediction: PredictionResponse;
}

export interface CasesListResponse {
  data: CaseRecord[];
  total: number;
}

export interface ClinicalReport {
  case_id: string;
  file_name: string | null;
  created_at: string;
  prediction: PredictionResponse;
}
