import type { PredictionResponse } from "./prediction";
import type { Feedback } from "./feedback";
import type { User } from "./user";

export interface ClinicalReport {
  id: string;
  caseId: string;
  prediction: PredictionResponse;
  feedback?: Feedback;
  reviewedBy?: Pick<User, "id" | "name" | "role">;
  reviewedAt?: string;
  generatedAt: string;
  institution: string;
  reportVersion: string;
  status: "draft" | "final" | "amended";
}