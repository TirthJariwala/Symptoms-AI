/** AI service FeedbackRequest — sent unchanged via backend. */
export interface FeedbackRequest {
  case_id: string;
  correct: boolean;
  quality_rating: number;
  comment?: string;
  escalate?: boolean;
  clinician_id: string;
}

/** AI service FeedbackResponse — received unchanged. */
export interface FeedbackResponse {
  case_id: string;
  reward_computed: number;
  message: string;
  timestamp: string;
}
